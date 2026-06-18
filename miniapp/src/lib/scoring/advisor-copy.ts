import type { QuestionnaireInput } from '@/lib/scoring/build-report';
import type {
  AdvisorDirectionCard,
  AdvisorMismatchType,
  DirectionGroup,
  DirectionGroupId
} from '@/types/assessment';

export type DirectionCardRole = 'push' | 'keep' | 'avoid';

// ---- P0-2: 用户-方向关系类型，让每张卡的吸引理由不同 ----
// 'exploring' 是默认：用户把它加进了清单，但没说是自己主动选的还是家长推的
// 不要默认判为"热度跟风"——很多方向只是"想了解、顺手勾了、暂时保留"

export type DirectionRelation = 'self-driven' | 'parent-pushed' | 'exploring';

export function detectDirectionRelation(
  input: QuestionnaireInput,
  directionId: DirectionGroupId
): DirectionRelation {
  if (input.selfPreferredDirections.includes(directionId)) return 'self-driven';
  if (input.parentPreferredDirections.includes(directionId)) return 'parent-pushed';
  return 'exploring';
}

// ---- 角色决策句：三类卡从第一句就拉开语气差距 ----

const roleDecisionTemplates: Record<DirectionCardRole, (direction: string) => string> = {
  push: (direction) => `如果我是你，我会先把${direction}认真看透，别急着摊更多方向。`,
  keep: (direction) => `${direction}可以先留在你的清单上，但现在别太早把它当成"已经想好了"的答案。`,
  avoid: (direction) => `在你把其他方向看清楚之前，我建议你先别让${direction}抢走太多注意力。不是它不好，是现在排太前对你不划算。`
};

// ---- P0-2: 根据关系类型产出不同的吸引点文案 ----

function buildAttractionLine(
  relation: DirectionRelation,
  input: QuestionnaireInput,
  direction: DirectionGroup
): string {
  const name = direction.title.replace(/类$/u, '');
  const priority = input.nonNegotiableFactor;

  switch (relation) {
    case 'self-driven':
      return `${name}是你自己主动挑的方向，说明你已经下意识在筛了。但越是你自己选的，越要小心——你最容易只看到它让你舒服的那一面，忽略它真正吃重的代价。你现在的第一优先级是「${priority}」，它到底能不能接住这个，需要再往下看一层。`;
    case 'parent-pushed':
      return `家长把${name}放进来，通常是因为它在某些硬指标上确实拿得出手。但家长看的是结果，你自己才要扛过程。你真正在意的「${priority}」和家长的标准不一定是同一件事，别把它们自动画等号。`;
    case 'exploring':
      return `${name}是你放进清单的方向之一。你还没有明确说它是你主动选的还是别人建议的——这种"先看看、先了解"的状态本身没问题。关键是：你真正在意的「${priority}」，它到底能不能接住？下面就是针对你这个优先级做的判断。`;
  }
}

// ---- 代价映射 ----

function directionCost(direction: DirectionGroup): string {
  if (direction.advancedDegreeDependency === '高') return '长培养周期和持续投入';
  if (direction.studyPressure === '高') return '高压训练和长期自我迭代';
  if (direction.industryVolatility === '高') return '更高的不确定性和波动';
  if (direction.cityConcentration === '高') return '对城市机会和平台环境的依赖';
  return '一段你得长期接受的训练节奏';
}

// ---- P0-2: 错配文案吃入方向和输入，后悔点更具体 ----

// ---- P0-2 深化: 错配文案按角色变调 ----
// push: 提醒但不劝退（"这个方向值得认真看，但你要知道它的代价"）
// keep: 暂缓但不否定（"先核实再决定"）
// avoid: 止损（当前强硬语气）

function mismatchLines(
  type: AdvisorMismatchType,
  direction: DirectionGroup,
  input: QuestionnaireInput,
  role: DirectionCardRole
): Pick<AdvisorDirectionCard, 'regretLine' | 'mismatchLine'> {
  const name = direction.title.replace(/类$/u, '');
  const cost = directionCost(direction);

  // 基础 regret/mismatch（avoid 角色使用）
  const base: Record<AdvisorMismatchType, { regretLine: string; mismatchLine: string }> = {
    'long-training-mismatch': {
      regretLine: `你以后最容易后悔的，不是${name}这条路太难，而是你明明对长周期投入已经很敏感了，却还是把它往前排。`,
      mismatchLine: `${name}的回报节奏和你现在能接受的投入周期正面撞上了——它需要你愿意为长期结果延迟满足。`
    },
    'hotness-misread': {
      regretLine: `你以后最容易后悔的，不是没赶上${name}这趟车，而是把热度当成了适合度。`,
      mismatchLine: `${name}机会多≠你能长期待得住。它要求持续自我迭代和高压输出，这和你对学习压力的态度正好冲突。`
    },
    'stability-illusion': {
      regretLine: `你以后最容易后悔的，不是没选"稳"的方向，而是把"看起来稳"当成了"自己读出来也会稳"。`,
      mismatchLine: `${name}的名声容易让人低估它实际的门槛和分化——${cost}是它绕不开的代价。`
    },
    'interest-imagination-gap': {
      regretLine: `你以后最容易后悔的，不是选了感兴趣的，而是选了"想象中感兴趣"的。`,
      mismatchLine: `${name}落到实际后的学习方式和日常节奏，和你脑子里想的很可能不是一回事。`
    },
    'cost-tolerance-mismatch': {
      regretLine: `你以后最容易后悔的，不是${name}本身，而是你明明知道最不想付的代价正好是"${cost}"，还是硬往前排。`,
      mismatchLine: `${name}最吃重的代价（${cost}）正好是你现在最抗拒承担的那一类——这不是方向不好，是代价类型和你的容忍区撞上了。`
    },
    'path-ambiguity-anxiety': {
      regretLine: `你以后最容易后悔的，不是没敢冲，而是进了${name}以后才发现这条路比你想的更分化。`,
      mismatchLine: `${name}通往结果的路径不够直白——你越需要"确定性"，一个分化大的方向就越容易让你走到一半反复焦虑。`
    }
  };

  const { regretLine, mismatchLine } = base[type] ?? base['path-ambiguity-anxiety'];

  // 按角色调整语气
  switch (role) {
    case 'push':
      // push 卡：先肯定方向值得看，再提醒代价，末尾给信心
      return {
        regretLine: `${regretLine}但话说回来，你现在认真看它是对的——只要把这些代价先看清楚，别自己骗自己，它值得你花时间深挖。`,
        mismatchLine: `我不是劝你别选${name}。我是劝你在往前排之前，先确认一件事：${mismatchLine.replace(/。$/u, '')}——这件事你越早知道，后面越不容易拧巴。`
      };
    case 'keep':
      // keep 卡：不否定，但要你先核实再决定
      return {
        regretLine: `${regretLine}这就是为什么我建议你先留着它、但别急着认定。`,
        mismatchLine: `${mismatchLine}先把这件事核实清楚，再决定要不要把它往前排。`
      };
    case 'avoid':
      // avoid 卡：直接止损
      return {
        regretLine: `${regretLine}这就是为什么我建议你现在别把它排太前。`,
        mismatchLine: mismatchLine
      };
  }
}

// ---- 错配识别引擎 ----

export function detectMismatchType(
  input: QuestionnaireInput,
  direction: DirectionGroup
): AdvisorMismatchType {
  if (
    input.rejectedRisks.includes('必须长期读研或继续深造') &&
    input.trainingCycleAcceptance === '不太接受' &&
    direction.advancedDegreeDependency === '高'
  ) {
    return 'long-training-mismatch';
  }

  if (
    input.nonNegotiableFactor === '未来发展空间' &&
    input.rejectedRisks.includes('课程难度高、学习压力大') &&
    direction.studyPressure === '高'
  ) {
    return 'hotness-misread';
  }

  if (
    input.topFactors.includes('就业稳定') &&
    direction.industryVolatility === '高'
  ) {
    return 'stability-illusion';
  }

  if (
    input.topFactors.includes('兴趣匹配') &&
    direction.pathClarity === '分化明显'
  ) {
    return 'interest-imagination-gap';
  }

  if (
    input.rejectedRisks.includes('强依赖资源、城市或人脉') &&
    (direction.cityConcentration === '高' || direction.platformDependency === '高')
  ) {
    return 'cost-tolerance-mismatch';
  }

  return 'path-ambiguity-anxiety';
}

// ---- 组装入口 ----

export function buildAdvisorCard(
  role: DirectionCardRole,
  mismatchType: AdvisorMismatchType,
  input: QuestionnaireInput,
  direction: DirectionGroup,
  relation: DirectionRelation
): AdvisorDirectionCard {
  return {
    decisionLine: roleDecisionTemplates[role](direction.title.replace(/类$/u, '')),
    attractionLine: buildAttractionLine(relation, input, direction),
    ...mismatchLines(mismatchType, direction, input, role),
    mismatchType
  };
}
