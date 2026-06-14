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
  archetypePriorityOrder,
  archetypeSignalWeightMap,
  enumToScore,
  factorWeightMap
} from '@/lib/scoring/scoring-rules';
import type {
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
type ScoredDirection = RecommendedDirection;
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
  const avoidTitle = ranking.avoidFirst ? stripDirectionSuffix(ranking.avoidFirst.title) : '最后那个方向';
  const risk = input.rejectedRisks[0] ?? '你最抗拒的代价';

  return `如果我是你，我会先把 ${primaryTitle} 放前面，再留着 ${secondaryTitle} 做对照。不是因为 ${primaryTitle} 听起来最厉害，而是它更贴着你现在真正在意的东西。至于 ${avoidTitle}，问题不是绝对不能选，而是你一旦把它排太前，后面大概率要为「${risk}」这件事反复付代价。`;
}

function buildRegretWarning(input: QuestionnaireInput, ranking: DirectionRanking): string {
  const avoidTitle = ranking.avoidFirst ? stripDirectionSuffix(ranking.avoidFirst.title) : '那个不该硬顶的方向';
  const parentPriority = input.parentTopFactors[0] ?? '现实确定性';
  const nonNegotiable = input.nonNegotiableFactor;

  return `你之后最容易后悔的，不是没选最热的，而是明明自己更在意「${nonNegotiable}」，最后却因为「${parentPriority}」或者外部评价，把 ${avoidTitle} 硬往前排。那种后悔通常不是填报当天发生的，而是读到一半才开始。`;
}

function buildMarketSnapshot(direction: RecommendedDirection): MarketInsightSnapshot {
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

function buildDirectionRanking(allRanked: ScoredDirection[]): DirectionRanking {
  return {
    primary: allRanked[0],
    secondary: allRanked[1] ?? null,
    avoidFirst: allRanked.length >= 3 ? allRanked[allRanked.length - 1] : null
  };
}

function buildActionItems(
  input: QuestionnaireInput,
  ranking: DirectionRanking
): ActionItem[] {
  const primaryTitle = ranking.primary.title;
  const secondaryTitle = ranking.secondary?.title ?? '第二建议方向';
  const avoidTitle = ranking.avoidFirst?.title ?? '暂不建议优先方向';
  return [
    {
      title: '只保留两个方向',
      detail: `接下来 48 小时里，只看 ${primaryTitle} 和 ${secondaryTitle}，先别继续摊更多新方向。${avoidTitle} 现在先放后面，不要再给它额外注意力。`
    },
    {
      title: '只砍一个分歧点',
      detail: `别一晚上把所有专业都摊开讲。只围绕你最在意的「${input.nonNegotiableFactor}」和家长最在意的「${input.parentTopFactors[0]}」谈一次，再顺手核实一个问题：${primaryTitle} 和 ${secondaryTitle} 到底哪个更容易让你以后少后悔。`
    }
  ];
}

export function buildReport(input: QuestionnaireInput): Report {
  const selectedIds = new Set(input.selectedDirections);

  const allRankedDirections = directionGroups
    .filter((group) => selectedIds.has(group.id))
    .map((group) => {
      const score =
        factorContribution(group, input.topFactors) +
        selfPreferenceBonus(group.id, input) +
        learningStyleBonus(group, input) +
        futurePathBonus(group, input) +
        input.rejectedRisks.reduce((total, risk) => total + riskPenalty(group, risk), 0) +
        input.parentRejectedRisks.reduce((total, risk) => total + riskPenalty(group, risk) / 2, 0) +
        trainingPenalty(group, input);

      return {
        id: group.id,
        title: group.title,
        score,
        reasons: buildReasons(group, input),
        tradeOffs: buildTradeOffs(group),
        fitSummary: buildFitSummary(group),
        cautionSummary: buildCautionSummary(group)
      };
    })
    .sort((a, b) => b.score - a.score);

  const directionRanking = buildDirectionRanking(allRankedDirections);
  const archetype = buildArchetype(input);
  const recommendedDirections = allRankedDirections.slice(0, Math.min(TOP_N, input.selectedDirections.length));
  const primaryMarketInsight = buildMarketSnapshot(directionRanking.primary);
  const secondaryMarketInsight = directionRanking.secondary
    ? buildMarketSnapshot(directionRanking.secondary)
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
