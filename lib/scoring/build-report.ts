// 高考专业方向决策辅助工具 - 报告生成
// 输入：问卷结果
// 输出：带有决策诊断、重点方向建议、行动建议的可解释报告

import type { z } from 'zod';

import { directionGroups } from '@/data/direction-groups';
import {
  directionMarketInsights,
  marketMethodologyNote,
  type DirectionMarketInsight,
  type MarketSource
} from '@/data/market-insights';
import { reportArchetypeCopyMap } from '@/data/report-archetypes';
import { questionnaireSchema } from '@/lib/validation/questionnaire-schema';
import {
  buildAdvisorCard,
  detectDirectionRelation,
  detectMismatchType,
  type DirectionCardRole,
  type DirectionRelation
} from '@/lib/scoring/advisor-copy';
import {
  archetypePriorityOrder,
  archetypeSignalWeightMap,
  enumToScore,
  factorWeightMap
} from '@/lib/scoring/scoring-rules';
import type {
  AdvisorDirectionCard,
  DirectionGroup,
  DirectionGroupId,
  MajorChoiceArchetype
} from '@/types/assessment';

export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;

type FactorName = QuestionnaireInput['topFactors'][number];
type RiskName = QuestionnaireInput['rejectedRisks'][number];

export interface RecommendedDirection {
  id: DirectionGroupId;
  title: string;
  score: number;
  reasons: string[];
  tradeOffs: string[];
  fitSummary: string;
  cautionSummary: string;
  advisorCard: AdvisorDirectionCard;
}

export interface ActionItem {
  title: string;
  detail: string;
}

export interface ComparisonRow {
  label: string;
  values: string[];
}

export interface MarketInsightSnapshot {
  directionId: DirectionGroupId;
  title: string;
  summary: string;
  employmentScope: string;
  advancedStudyLoad: string;
  cityConcentration: string;
  aiSignal: string;
  industryMomentum: string;
  admissionSignal: string;
  caution: string;
  decisionNote: string;
  sources: MarketSource[];
}

export interface DirectionRanking {
  primary: RecommendedDirection;
  secondary: RecommendedDirection | null;
  avoidFirst: RecommendedDirection | null;
}

export interface Report {
  archetype: MajorChoiceArchetype;
  archetypeSummary: string;
  expertVerdict: {
    headline: string;
    diagnosis: string;
    whyThisOrder: string;
    regretWarning: string;
  };
  summary: {
    decisionStyle: string;
    coreConflict: string;
    familyDifference: string;
    riskBoundary: string;
    nextFocus: string;
  };
  directionRanking: DirectionRanking;
  recommendedDirections: RecommendedDirection[];
  marketInsights: {
    primary: MarketInsightSnapshot;
    secondary: MarketInsightSnapshot | null;
    comparisonRows: ComparisonRow[];
    methodologyNote: string;
  };
  actions: ActionItem[];
}

const TOP_N = 3;

const pathStabilityText = {
  '尽快就业': '尽快形成可落地的就业路径',
  '本科后再看': '先保留选择空间，再逐步收敛',
  '接受继续深造': '把长期培养和深造价值纳入判断',
  '希望路径稳定清晰': '优先考虑路径更清晰、波动更低的方向',
  '希望空间大、成长快': '优先考虑成长空间更大的方向'
} as const;

type WeightField = keyof (typeof factorWeightMap)[FactorName];
type ChoiceWeights<T extends string> = Partial<Record<T, number>>;

function scoreField(group: DirectionGroup, field: WeightField, weight: number): number {
  const rawValue = group[field];
  if (typeof rawValue !== 'string') {
    return 0;
  }
  const valueScore = enumToScore(rawValue);
  const preferredScore = weight >= 0 ? valueScore : 2 - valueScore;
  return preferredScore * Math.abs(weight);
}

function scoreSingleChoice<T extends string>(value: T, weights?: ChoiceWeights<T>): number {
  return weights?.[value] ?? 0;
}

function scoreMultiChoice<T extends string>(values: readonly T[], weights?: ChoiceWeights<T>): number {
  if (!weights) {
    return 0;
  }

  return values.reduce((total, value) => total + (weights[value] ?? 0), 0);
}

function selfPreferenceBonus(groupId: DirectionGroupId, input: QuestionnaireInput): number {
  if (input.selfPreferredDirections.includes(groupId)) {
    return 4;
  }
  if (input.parentPreferredDirections.includes(groupId)) {
    return 2;
  }
  return 0;
}

function learningStyleBonus(group: DirectionGroup, input: QuestionnaireInput): number {
  return group.learningStyle.includes(input.learningStyle) ? 3 : 0;
}

function futurePathBonus(group: DirectionGroup, input: QuestionnaireInput): number {
  if (input.futurePath === '希望空间大、成长快') {
    return enumToScore(group.growthPotential) * 2;
  }
  if (input.futurePath === '希望路径稳定清晰') {
    return enumToScore(group.pathClarity) * 2 + (2 - enumToScore(group.industryVolatility));
  }
  if (input.futurePath === '尽快就业') {
    return enumToScore(group.jobBreadth) + enumToScore(group.pathClarity);
  }
  if (input.futurePath === '接受继续深造') {
    return enumToScore(group.advancedDegreeDependency) * 2;
  }
  return 1;
}

function riskPenalty(group: DirectionGroup, risk: RiskName): number {
  switch (risk) {
    case '课程难度高、学习压力大':
      return group.studyPressure === '高' ? -5 : 0;
    case '必须长期读研或继续深造':
      return group.advancedDegreeDependency === '高' ? -7 : 0;
    case '就业面比较窄':
      return group.jobBreadth === '窄' ? -6 : 0;
    case '工作强度高':
      return group.studyPressure === '高' || group.industryVolatility === '高' ? -3 : 0;
    case '行业波动大':
      return group.industryVolatility === '高' ? -6 : 0;
    case '强依赖证书或考试':
      return group.advancedDegreeDependency === '高' || group.pathClarity === '分化明显' ? -4 : 0;
    case '强依赖资源、城市或人脉':
      return group.cityConcentration === '高' || group.platformDependency === '高' ? -5 : 0;
    default:
      return 0;
  }
}

function trainingPenalty(group: DirectionGroup, input: QuestionnaireInput): number {
  if (input.trainingCycleAcceptance === '不太接受' && group.advancedDegreeDependency === '高') {
    return -8;
  }
  if (input.longTermTradeoffAcceptance === '不太接受' && group.studyPressure === '高') {
    return -4;
  }
  return 0;
}

function factorContribution(group: DirectionGroup, factors: FactorName[]): number {
  return factors.reduce((total, factor) => {
    const weights = factorWeightMap[factor];
    const entries = Object.entries(weights) as [WeightField, number][];
    return total + entries.reduce((sum, [field, weight]) => sum + scoreField(group, field, weight), 0);
  }, 0);
}

function buildReasons(group: DirectionGroup, input: QuestionnaireInput): string[] {
  const reasons: string[] = [];

  if (input.selfPreferredDirections.includes(group.id)) {
    reasons.push('如果这本来就是你自己会主动去看的方向，那它值得被认真往前排，不只是“先放着看看”。');
  }
  if (input.parentPreferredDirections.includes(group.id)) {
    reasons.push('它至少不是一个一开口就会被家里强烈反对的方向，后面谈起来阻力会小很多。');
  }
  if (group.learningStyle.includes(input.learningStyle)) {
    reasons.push(`如果你真实的学习状态更接近「${input.learningStyle}」，那这条路你大概率更扛得住，不容易读到一半开始怀疑自己。`);
  }
  if (input.topFactors.includes('未来发展空间') && group.growthPotential === '高') {
    reasons.push('你既然在意上限，就别把自己过早塞进一条很快见顶的路，这个方向至少还有往上走的空间。');
  }
  if (input.topFactors.includes('就业稳定') && group.industryVolatility === '低') {
    reasons.push('如果你现在最怕的是走得太飘，这个方向至少没那么容易让你毕业后第一脚就踩空。');
  }
  if (reasons.length === 0) {
    reasons.push('真要选，它至少比那些只靠想象支撑的方向更值得你花时间深挖。');
  }

  return reasons.slice(0, 3);
}

function buildTradeOffs(group: DirectionGroup): string[] {
  return [
    group.riskNotes[0] ?? '需要进一步核实真实代价。',
    group.riskNotes[1] ?? '需要结合学校与城市环境再判断。'
  ];
}

function buildFitSummary(group: DirectionGroup): string {
  return group.suitableFor[0] ?? '适合补充更多信息后再判断。';
}

function buildCautionSummary(group: DirectionGroup): string {
  return group.cautionFor[0] ?? group.riskNotes[0] ?? '暂未发现明显风险提示。';
}

function stripDirectionSuffix(title: string): string {
  return title.replace(/类$/u, '');
}

function buildHeadline(archetype: MajorChoiceArchetype): string {
  switch (archetype) {
    case '成长优先型':
      return '你不是没想法，你是容易在“上限”和“安全感”之间来回摇摆。';
    case '现实安全型':
      return '你更适合先把路走稳，再谈是不是最热门。';
    case '低后悔成本型':
      return '你现在最该做的，不是挑最光鲜的，而是先排掉以后大概率会后悔的。';
    case '兴趣摇摆型':
      return '你不是没有兴趣，你只是还没把短期好感和长期适配分开。';
    case '稳中求进型':
    default:
      return '你适合的不是最极端的那条路，而是能往上走、又不用你硬赌的方向。';
  }
}

function buildDiagnosis(
  input: QuestionnaireInput,
  ranking: DirectionRanking,
  archetype: MajorChoiceArchetype
): string {
  const primaryTitle = stripDirectionSuffix(ranking.primary.title);
  const secondaryTitle = ranking.secondary ? stripDirectionSuffix(ranking.secondary.title) : '第二方向';

  switch (archetype) {
    case '成长优先型':
      return `你心里其实更偏向有成长空间的方向，所以我会先看 ${primaryTitle} 和 ${secondaryTitle}。真正拖住你的，不是没方向，而是你一边想往上走，一边又怕走得太累。`;
    case '现实安全型':
      return `你现在最需要的不是再听一轮“热门专业分析”，而是先确认哪条路更容易稳稳落地。对你来说，方向好不好，不只看名头，更看毕业后能不能接得住。`;
    case '低后悔成本型':
      return `你现在的思路其实很像很多谨慎型考生：宁可晚一点定，也不想一把押错。这个思路没问题，但前提是先把明显不划算的方向淘汰掉。`;
    case '兴趣摇摆型':
      return `你现在最容易被“听起来不错”和“别人都在说”带着走，所以这份报告不能只给你资料，必须先替你收口，不然你会越看越散。`;
    case '稳中求进型':
    default:
      return `你不是保守，也不是冒进。你更像是在找一条自己能走下去、而且几年后回头看也不亏的路。所以排序时，稳和成长都要算，但不能各打一半。`;
  }
}

function buildWhyThisOrder(input: QuestionnaireInput, ranking: DirectionRanking): string {
  const primaryTitle = stripDirectionSuffix(ranking.primary.title);
  const secondaryTitle = ranking.secondary ? stripDirectionSuffix(ranking.secondary.title) : '第二方向';
  const avoidTitle = ranking.avoidFirst ? stripDirectionSuffix(ranking.avoidFirst.title) : null;
  const risk = input.rejectedRisks[0] ?? '你最抗拒的代价';

  if (avoidTitle) {
    return `如果我是你，我会先把 ${primaryTitle} 放前面，再留着 ${secondaryTitle} 做对照。不是因为 ${primaryTitle} 听起来最厉害，而是它更贴着你现在真正在意的东西。至于 ${avoidTitle}，问题不是绝对不能选，而是你一旦把它排太前，后面大概率要为「${risk}」这件事反复付代价。`;
  }

  return `如果我是你，我会先把 ${primaryTitle} 放前面，再留着 ${secondaryTitle} 做对照。不是因为 ${primaryTitle} 听起来最厉害，而是它更贴着你现在真正在意的东西。你现在选的这两个方向之间已经有了足够的对比度——接下来不是继续摊新方向，而是把这两个真正吃透。`;
}

function buildRegretWarning(input: QuestionnaireInput, ranking: DirectionRanking): string {
  const nonNegotiable = input.nonNegotiableFactor;
  const parentPriority = input.parentTopFactors[0] ?? '现实确定性';

  if (ranking.avoidFirst) {
    const avoidTitle = stripDirectionSuffix(ranking.avoidFirst.title);
    return `你之后最容易后悔的，不是没选最热的，而是明明自己更在意「${nonNegotiable}」，最后却因为「${parentPriority}」或者外部评价，把 ${avoidTitle} 硬往前排。那种后悔通常不是填报当天发生的，而是读到一半才开始。`;
  }

  return `你之后最容易后悔的，不是没选最热的，而是明明自己更在意「${nonNegotiable}」，最后却因为「${parentPriority}」或者外部评价，做了一个违心的选择。那种后悔通常不是填报当天发生的，而是读到一半才开始。把现在排第一的方向认真看透，比再多看三个新方向都更有用。`;
}

// ---- P1: 把市场现实翻译成决策语言 ----
// 不是堆数据，而是告诉考生"这个数据对你意味着什么"

function buildDecisionNote(
  group: DirectionGroup,
  input: QuestionnaireInput
): string {
  const notes: string[] = [];

  // 城市集中度 → 考生是否需要优先去一线
  if (group.cityConcentration === '高') {
    notes.push('这个方向的优质岗位高度集中在一线和强二线城市。如果你毕业后不想优先去这些城市，它就不适合排第一。');
  }

  // 深造依赖 → 考生是否愿意读研
  if (group.advancedDegreeDependency === '高' && input.trainingCycleAcceptance === '不太接受') {
    notes.push('它对读研有硬性要求。如果你现在就不想读研，这条路后面会越来越拧巴——这不是能力问题，是路径本身就不匹配你的规划。');
  } else if (group.advancedDegreeDependency === '高') {
    notes.push('读研对这条路不是"可选项"，是拿到核心岗位的硬门票。如果你能接受继续深造，它的回报是值得的；如果不能，需要把预期调低。');
  }

  // 学习压力 → 考生是否抗拒
  if (group.studyPressure === '高' && input.rejectedRisks.includes('课程难度高、学习压力大')) {
    notes.push('它的课程压力和训练强度明显高于多数方向——而你已经表达过对高压学习的抗拒。这不是"再努力一点就能克服"的问题，是每天的节奏是否真的适合你。');
  }

  // 行业波动 → 考生是否担心
  if (group.industryVolatility === '高' && input.rejectedRisks.includes('行业波动大')) {
    notes.push('这个方向行业变化快、不确定性高，和你对稳定性的要求是正面冲突的。如果选它，你要做好"每隔几年就要重新判断方向"的心理准备。');
  }

  // 路径清晰度 → 考生是否需要确定性
  if (group.pathClarity === '分化明显' && input.futurePath === '希望路径稳定清晰') {
    notes.push('它的出路天然分化大，不像师范或医学那样有明确的职业轨道。如果你需要一开始就知道5年后在哪，这种方向会让你在中间阶段反复犹豫。');
  }

  if (notes.length === 0) {
    return '从目前的信息看，这个方向的核心条件和你的偏好之间没有明显的硬冲突。但建议你重点核实上面的"先别误判"提醒。';
  }

  return notes.join(' ');
}

function buildMarketSnapshot(
  direction: RecommendedDirection,
  group: DirectionGroup,
  input: QuestionnaireInput
): MarketInsightSnapshot {
  const insight = directionMarketInsights[direction.id];

  return {
    directionId: direction.id,
    title: direction.title,
    summary: insight.summary,
    employmentScope: insight.employmentScope,
    advancedStudyLoad: insight.advancedStudyLoad,
    cityConcentration: insight.cityConcentration,
    aiSignal: insight.aiSignal,
    industryMomentum: insight.industryMomentum,
    admissionSignal: insight.admissionSignal,
    caution: insight.caution,
    decisionNote: buildDecisionNote(group, input),
    sources: insight.sources
  };
}

function comparisonValue(
  insight: DirectionMarketInsight | undefined,
  field:
    | 'employmentScope'
    | 'advancedStudyLoad'
    | 'cityConcentration'
    | 'aiSignal'
    | 'industryMomentum'
    | 'admissionSignal'
): string {
  return insight?.[field] ?? '暂无';
}

function buildComparisonRows(
  primary: RecommendedDirection,
  secondary: RecommendedDirection | null
): ComparisonRow[] {
  const primaryInsight = directionMarketInsights[primary.id];
  const secondaryInsight = secondary ? directionMarketInsights[secondary.id] : undefined;

  return [
    {
      label: '就业面宽度',
      values: [
        comparisonValue(primaryInsight, 'employmentScope'),
        comparisonValue(secondaryInsight, 'employmentScope')
      ]
    },
    {
      label: '继续深造依赖',
      values: [
        comparisonValue(primaryInsight, 'advancedStudyLoad'),
        comparisonValue(secondaryInsight, 'advancedStudyLoad')
      ]
    },
    {
      label: '城市集中度',
      values: [
        comparisonValue(primaryInsight, 'cityConcentration'),
        comparisonValue(secondaryInsight, 'cityConcentration')
      ]
    },
    {
      label: 'AI影响',
      values: [
        comparisonValue(primaryInsight, 'aiSignal'),
        comparisonValue(secondaryInsight, 'aiSignal')
      ]
    },
    {
      label: '产业景气',
      values: [
        comparisonValue(primaryInsight, 'industryMomentum'),
        comparisonValue(secondaryInsight, 'industryMomentum')
      ]
    },
    {
      label: '报考录取信号',
      values: [
        comparisonValue(primaryInsight, 'admissionSignal'),
        comparisonValue(secondaryInsight, 'admissionSignal')
      ]
    }
  ];
}

function buildDecisionStyle(input: QuestionnaireInput): string {
  if (input.nonNegotiableFactor === '未来发展空间') {
    return '你当前更适合先比较长期空间，再决定是否接受相应代价。';
  }
  if (input.nonNegotiableFactor === '就业稳定') {
    return '你当前更适合先筛掉波动较大的方向，再在剩余方向里比较发展性。';
  }
  if (input.nonNegotiableFactor === '学习过程不要太痛苦') {
    return '你当前更适合先排除学习负担过重的方向，再看现实机会。';
  }
  return `你当前更适合围绕「${input.nonNegotiableFactor}」先收缩范围，再做深入比较。`;
}

function buildFamilyDifference(input: QuestionnaireInput): string {
  const selfPrimary = input.nonNegotiableFactor;
  const parentPrimary = input.parentTopFactors[0];

  if (selfPrimary === parentPrimary) {
    return `你和家长都把「${selfPrimary}」放在前面，分歧更多来自第二优先级不同。`;
  }

  return `你更优先考虑「${selfPrimary}」，而家长当前更优先考虑「${parentPrimary}」。`;
}

function buildCoreConflict(input: QuestionnaireInput): string {
  if (input.topFactors.includes('未来发展空间') && input.parentTopFactors.includes('就业稳定')) {
    return '你更在意长期成长，家长更在意短期确定性，这会直接影响方向排序。';
  }
  if (input.rejectedRisks.includes('必须长期读研或继续深造')) {
    return '你当前对长培养周期较敏感，所以很多“后劲强但起步慢”的方向需要谨慎。';
  }
  if (input.rejectedRisks.includes('行业波动大')) {
    return '你当前不是没有方向，而是在成长空间与行业波动之间做取舍。';
  }
  return '你当前的难点不是缺信息，而是几个方向各有优点，真正卡在取舍顺序。';
}

function buildRiskBoundary(input: QuestionnaireInput): string {
  const userRisks = input.rejectedRisks.slice(0, 2).join('、');
  const parentRisks = input.parentRejectedRisks.slice(0, 1).join('、');

  if (parentRisks) {
    return `你当前最不想承担的是「${userRisks}」，而家长尤其担心「${parentRisks}」。`;
  }
  return `你当前最不想承担的是「${userRisks}」。`;
}

function countDirectionOverlap(input: QuestionnaireInput): number {
  const parentSet = new Set(input.parentPreferredDirections);
  return input.selfPreferredDirections.filter((id) => parentSet.has(id)).length;
}

function buildArchetype(input: QuestionnaireInput): MajorChoiceArchetype {
  const overlapCount = countDirectionOverlap(input);
  const scores = archetypePriorityOrder.map((archetype) => {
    const signalWeights = archetypeSignalWeightMap[archetype];
    let score = 0;

    score += scoreMultiChoice(input.topFactors, signalWeights.topFactors);
    score += scoreSingleChoice(input.nonNegotiableFactor, signalWeights.nonNegotiableFactor);
    score += scoreSingleChoice(input.futurePath, signalWeights.futurePath);
    score += scoreSingleChoice(
      input.longTermTradeoffAcceptance,
      signalWeights.longTermTradeoffAcceptance
    );
    score += scoreSingleChoice(
      input.trainingCycleAcceptance,
      signalWeights.trainingCycleAcceptance
    );
    score += scoreSingleChoice(input.learningStyle, signalWeights.learningStyle);
    score += scoreMultiChoice(input.rejectedRisks, signalWeights.rejectedRisks);

    switch (archetype) {
      case '稳中求进型':
        if (
          input.topFactors.includes('未来发展空间') &&
          input.topFactors.includes('就业稳定')
        ) {
          score += 4;
        }
        if (overlapCount > 0) {
          score += 2;
        }
        if (input.longTermTradeoffAcceptance === '看情况') {
          score += 1;
        }
        if (input.trainingCycleAcceptance === '有压力但可考虑') {
          score += 1;
        }
        if (
          input.nonNegotiableFactor === '未来发展空间' &&
          input.futurePath === '希望空间大、成长快'
        ) {
          score -= 2;
        }
        break;
      case '成长优先型':
        if (
          input.nonNegotiableFactor === '未来发展空间' &&
          input.futurePath === '希望空间大、成长快'
        ) {
          score += 4;
        }
        if (input.topFactors[0] === '未来发展空间') {
          score += 2;
        }
        if (input.parentTopFactors.includes('就业稳定')) {
          score += 1;
        }
        if (input.rejectedRisks.includes('行业波动大')) {
          score -= 2;
        }
        if (input.rejectedRisks.includes('必须长期读研或继续深造')) {
          score -= 3;
        }
        if (input.longTermTradeoffAcceptance === '不太接受') {
          score -= 2;
        }
        if (input.trainingCycleAcceptance === '不太接受') {
          score -= 2;
        }
        break;
      case '低后悔成本型':
        if (input.selectedDirections.length >= 4) {
          score += 1;
        }
        if (input.selfPreferredDirections.length !== 1) {
          score += 1;
        }
        if (overlapCount === 0) {
          score += 1;
        }
        if (
          input.rejectedRisks.includes('就业面比较窄') &&
          input.rejectedRisks.includes('必须长期读研或继续深造')
        ) {
          score += 2;
        }
        break;
      case '现实安全型':
        if (input.parentTopFactors.includes('就业稳定')) {
          score += 2;
        }
        if (input.parentRejectedRisks.includes('行业波动大')) {
          score += 1;
        }
        if (
          input.futurePath === '希望路径稳定清晰' &&
          input.rejectedRisks.includes('行业波动大')
        ) {
          score += 2;
        }
        if (input.nonNegotiableFactor === '未来发展空间') {
          score -= 2;
        }
        break;
      case '兴趣摇摆型':
        if (input.learningStyle === '暂时不确定') {
          score += 3;
        }
        if (input.selfPreferredDirections.length === 0) {
          score += 2;
        }
        if (overlapCount === 0) {
          score += 1;
        }
        if (
          input.topFactors.includes('兴趣匹配') &&
          input.nonNegotiableFactor === '兴趣匹配'
        ) {
          score += 2;
        }
        if (
          input.nonNegotiableFactor === '就业稳定' ||
          input.nonNegotiableFactor === '未来发展空间'
        ) {
          score -= 1;
        }
        break;
    }

    return { archetype, score };
  });

  scores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return archetypePriorityOrder.indexOf(a.archetype) - archetypePriorityOrder.indexOf(b.archetype);
  });

  return scores[0].archetype;
}

function buildDirectionRanking(allRanked: RecommendedDirection[]): DirectionRanking {
  return {
    primary: allRanked[0],
    secondary: allRanked[1] ?? null,
    avoidFirst: allRanked.length >= 3 ? allRanked[allRanked.length - 1] : null
  };
}

function directionRole(index: number, total: number): DirectionCardRole {
  if (index === 0) return 'push';
  if (index === 1) return 'keep';
  if (index === total - 1) return 'avoid';
  return 'keep';
}

// ---- P0-1: Archetype 与方向评分咬合 ----
// 人格判断定下来之后，用它来约束方向排序，避免"说你稳却推你冲"的信任裂缝。

function archetypeAdjustment(
  group: DirectionGroup,
  archetype: MajorChoiceArchetype,
  input: QuestionnaireInput
): number {
  switch (archetype) {
    case '现实安全型':
      // 最怕波动、高压、不确定——对稳的方向加分，对飘的方向狠狠扣分
      let safetyScore = 0;
      if (group.industryVolatility === '高') safetyScore -= 8;
      if (group.studyPressure === '高') safetyScore -= 4;
      if (group.cityConcentration === '高') safetyScore -= 3;
      if (group.pathClarity === '清晰') safetyScore += 4;
      if (group.industryVolatility === '低') safetyScore += 5;
      if (group.jobBreadth === '窄') safetyScore -= 2;
      return safetyScore;

    case '成长优先型':
      // 在意上限，但前提是能扛住压力和波动
      let growthScore = 0;
      if (group.growthPotential === '高') growthScore += 4;
      if (group.industryVolatility === '高' && input.rejectedRisks.includes('行业波动大'))
        growthScore -= 5;
      if (group.jobBreadth === '窄') growthScore -= 3;
      return growthScore;

    case '低后悔成本型':
      // 最怕选了之后发现代价太大——对长周期、高投入方向扣分
      let regretScore = 0;
      if (group.advancedDegreeDependency === '高') regretScore -= 6;
      if (group.jobBreadth === '窄') regretScore -= 5;
      if (group.pathClarity === '清晰') regretScore += 3;
      if (group.industryVolatility === '低') regretScore += 2;
      if (group.studyPressure === '高') regretScore -= 3;
      return regretScore;

    case '兴趣摇摆型':
      // 需要清晰路径和较低的学习压力，避免越读越迷茫
      let clarityScore = 0;
      if (group.pathClarity === '分化明显') clarityScore -= 5;
      if (group.pathClarity === '清晰') clarityScore += 5;
      if (group.studyPressure === '高') clarityScore -= 3;
      if (group.jobBreadth === '窄') clarityScore -= 2;
      return clarityScore;

    case '稳中求进型':
    default:
      // 稳和成长都要算，但极端方向不适合
      let balanceScore = 0;
      if (group.industryVolatility === '高') balanceScore -= 4;
      if (group.advancedDegreeDependency === '高') balanceScore -= 3;
      if (group.growthPotential === '高') balanceScore += 2;
      if (group.pathClarity === '清晰') balanceScore += 2;
      if (group.jobBreadth === '窄') balanceScore -= 2;
      return balanceScore;
  }
}

// ---- P0-3 深化: 行动建议覆盖报告的真正主矛盾 ----
// 不再只盯第一推荐方向的错配，而是覆盖：
// ① 首选方向的代价核实 ② 首选 vs 次选的二选一 ③ 家长分歧化解 ④ 止损方向警告

function buildActionItems(
  input: QuestionnaireInput,
  ranking: DirectionRanking
): ActionItem[] {
  const primaryName = ranking.primary.title.replace(/类$/u, '');
  const secondaryName = ranking.secondary?.title.replace(/类$/u, '') ?? '第二建议方向';
  const avoidName = ranking.avoidFirst?.title.replace(/类$/u, '') ?? null;
  const mismatchType = ranking.primary.advisorCard.mismatchType;
  const actions: ActionItem[] = [];

  // ① 首选方向的代价核实（按错配类型）
  const mismatchChecks: Record<string, ActionItem> = {
    'long-training-mismatch': {
      title: `今晚核实：${primaryName}到底要读几年`,
      detail: `去阳光高考网或目标院校官网，查${primaryName}的真实学制路径——本科几年、要不要读研、读研又是几年。别自己猜。算清楚总年数之后问自己：我真的愿意为它花这么多年吗？`
    },
    'hotness-misread': {
      title: `把${primaryName}的"热度"和"适合度"拆开看`,
      detail: `找2个在读${primaryName}的学长或真实分享（B站、知乎、目标院校贴吧），只看一件事：他们日常最痛苦的是什么。如果那个痛苦正好是你最不想扛的，热度再高也和你没关系。`
    },
    'stability-illusion': {
      title: `拆开${primaryName}的"稳"——到底是哪种稳`,
      detail: `"稳"分两种：一种是"进去就稳了"，一种是"你得先过好几关才稳"。去查${primaryName}的真实淘汰率、资格证要求和转行率，别用名头代替数据。`
    },
    'interest-imagination-gap': {
      title: `找${primaryName}在读学生的一天`,
      detail: `去B站或知乎找2个${primaryName}在读学生的vlog或日常分享，只看他们普通的一天是怎么过的。别只看高光时刻。如果日常让你觉得"和想的不太一样"，这个信号要认真对待。`
    },
    'cost-tolerance-mismatch': {
      title: `把${primaryName}的代价写下来，然后诚实画圈`,
      detail: `拿张纸，左边写${primaryName}最吸引你的3个点，右边写它最需要你付出的3个代价。然后诚实圈出：右边有没有你"打死也不想长期承受"的东西。如果有，这就是红灯。`
    },
    'path-ambiguity-anxiety': {
      title: `画出${primaryName}的3条真实出路`,
      detail: `去查${primaryName}最近两三届毕业生的真实去向（学校就业报告、招聘平台），不是"能做什么"，而是"实际去了哪里"。如果去向太分散、和你预期差距大，这条路天然需要你自己做更多判断。`
    }
  };
  const check = mismatchChecks[mismatchType] ?? mismatchChecks['path-ambiguity-anxiety'];
  actions.push(check);

  // ② 首选 vs 次选：二选一的真正刀子
  if (ranking.secondary) {
    actions.push({
      title: `${primaryName} vs ${secondaryName}：今晚只砍一刀`,
      detail: `别比"哪个更好"，比"哪个的代价你更愿意长期付"。拿出一张纸，两列并排：左边写${primaryName}的核心代价，右边写${secondaryName}的核心代价。然后画掉你打死不想承受的那一边——剩下的就是今晚的结论。`
    });
  }

  // ③ 家长分歧化解（当自己最在意的事 ≠ 家长最在意的事时）
  const selfPriority = input.nonNegotiableFactor;
  const parentPriority = input.parentTopFactors[0];
  if (selfPriority !== parentPriority) {
    actions.push({
      title: `跟家长谈一次，但只谈一个分歧点`,
      detail: `你最在意「${selfPriority}」，家长最在意「${parentPriority}」。今晚只围绕这一个分歧谈：把你为什么更看重「${selfPriority}」的理由说清楚，也认真听家长为什么坚持「${parentPriority}」——不要求达成一致，只要求双方都听懂了对方的逻辑。`
    });
  }

  // ④ 止损方向警告（当存在需要强力劝退的方向时）
  if (avoidName) {
    actions.push({
      title: `给${avoidName}一个明确的"先不碰"标签`,
      detail: `不是永远否定它，而是明确告诉自己和家长：在把${primaryName}和${secondaryName}吃透之前，${avoidName}不再占用今晚和明天的比较时间。把它从"待比较清单"里先划掉，48小时后再决定要不要重新看。`
    });
  }

  return actions;
}

export function buildReport(input: QuestionnaireInput): Report {
  const selectedIds = new Set(input.selectedDirections);

  // ---- P0-1: Archetype 先算，再用于方向评分 ----
  const archetype = buildArchetype(input);

  // Step 1: 评分 → 排序（不涉及排序位置的字段在此计算）
  const scoredDirections = directionGroups
    .filter((group) => selectedIds.has(group.id))
    .map((group) => {
      const score =
        factorContribution(group, input.topFactors) +
        selfPreferenceBonus(group.id, input) +
        learningStyleBonus(group, input) +
        futurePathBonus(group, input) +
        input.rejectedRisks.reduce((total, risk) => total + riskPenalty(group, risk), 0) +
        input.parentRejectedRisks.reduce((total, risk) => total + riskPenalty(group, risk) / 2, 0) +
        trainingPenalty(group, input) +
        archetypeAdjustment(group, archetype, input);

      return {
        group,
        score,
        reasons: buildReasons(group, input),
        tradeOffs: buildTradeOffs(group),
        fitSummary: buildFitSummary(group),
        cautionSummary: buildCautionSummary(group)
      };
    })
    .sort((a, b) => b.score - a.score);

  // Step 2: 排序后再确定角色与顾问文案（push/keep/avoid 依赖排序位置）
  const rankedWithAdvisorRoles: RecommendedDirection[] = scoredDirections.map(
    ({ group, score, reasons, tradeOffs, fitSummary, cautionSummary }, index, source) => {
      const role = directionRole(index, source.length);
      const mismatchType = detectMismatchType(input, group);
      const relation = detectDirectionRelation(input, group.id);

      return {
        id: group.id,
        title: group.title,
        score,
        reasons,
        tradeOffs,
        fitSummary,
        cautionSummary,
        advisorCard: buildAdvisorCard(role, mismatchType, input, group, relation)
      };
    }
  );

  const directionRanking = buildDirectionRanking(rankedWithAdvisorRoles);
  const recommendedDirections = rankedWithAdvisorRoles.slice(0, Math.min(TOP_N, input.selectedDirections.length));

  const primaryGroup = directionGroups.find((g) => g.id === directionRanking.primary.id)!;
  const secondaryDir = directionRanking.secondary;
  const secondaryGroup = secondaryDir
    ? directionGroups.find((g) => g.id === secondaryDir.id)!
    : null;

  const primaryMarketInsight = buildMarketSnapshot(directionRanking.primary, primaryGroup, input);
  const secondaryMarketInsight = directionRanking.secondary && secondaryGroup
    ? buildMarketSnapshot(directionRanking.secondary, secondaryGroup, input)
    : null;

  return {
    archetype,
    archetypeSummary: reportArchetypeCopyMap[archetype].hitSentence,
    expertVerdict: {
      headline: buildHeadline(archetype),
      diagnosis: buildDiagnosis(input, directionRanking, archetype),
      whyThisOrder: buildWhyThisOrder(input, directionRanking),
      regretWarning: buildRegretWarning(input, directionRanking)
    },
    summary: {
      decisionStyle: buildDecisionStyle(input),
      coreConflict: buildCoreConflict(input),
      familyDifference: buildFamilyDifference(input),
      riskBoundary: buildRiskBoundary(input),
      nextFocus: [directionRanking.primary.title, directionRanking.secondary?.title]
        .filter(Boolean)
        .join('、')
    },
    directionRanking,
    recommendedDirections,
    marketInsights: {
      primary: primaryMarketInsight,
      secondary: secondaryMarketInsight,
      comparisonRows: buildComparisonRows(directionRanking.primary, directionRanking.secondary),
      methodologyNote: marketMethodologyNote
    },
    actions: buildActionItems(input, directionRanking)
  };
}
