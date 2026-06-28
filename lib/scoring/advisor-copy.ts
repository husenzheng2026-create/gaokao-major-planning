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
// push: 正向判断，不加"但是"
// keep: 中性保留，不下重判断
// avoid: 明确止损，不留暧昧

const roleDecisionTemplates: Record<DirectionCardRole, (direction: string, input: QuestionnaireInput) => string> = {
  push: (direction, input) => {
    const priority = input.nonNegotiableFactor;
    return `${direction}可以优先看——不是因为它听起来最热，而是它在「${priority}」这个你最在意的点上更接得住。`;
  },
  keep: (direction) => `${direction}可以先留着做对照，但现在别急着把它当成"已经想好了"的答案。`,
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
      return `${name}是你自己主动挑的方向——越是你自己选的，越要小心只看到它让你舒服的那一面。它能不能接住你最在意的「${priority}」，需要再往下看一层。`;
    case 'parent-pushed':
      return `家长把${name}放进来，通常是因为它在硬指标上拿得出手。但家长看的是结果，你自己才要扛过程——你真正在意的「${priority}」和家长的标准不一定是同一件事。`;
    case 'exploring':
      return `${name}是你放进清单的方向之一。关键问题是：你真正在意的「${priority}」，它到底能不能接住？下面就是针对你这个优先级做的判断。`;
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

// ---- 错配文案：按角色独立撰写，push/keep/avoid 不再互相派生 ----
// push: 一句为什么值得排前 + 一句风险前提（只提醒一次）
// keep: 一句为什么先留着 + 一句核实建议
// avoid: 一句后悔风险 + 一句硬冲突

function mismatchLines(
  type: AdvisorMismatchType,
  direction: DirectionGroup,
  input: QuestionnaireInput,
  role: DirectionCardRole
): Pick<AdvisorDirectionCard, 'regretLine' | 'mismatchLine'> {
  const name = direction.title.replace(/类$/u, '');
  const cost = directionCost(direction);

  // push 卡：正向为主，风险仅作为"前提"提一次，不重复表达
  const pushCopy: Record<AdvisorMismatchType, { regretLine: string; mismatchLine: string }> = {
    'long-training-mismatch': {
      regretLine: `它值得看，因为回报是实的——前提是你能接受读完研再真正发力，这个时间成本不是所有人都愿意付。`,
      mismatchLine: `提前确认学制路径：本科几年、要不要读研、读研又是几年。算清楚总年数，别自己猜。`
    },
    'hotness-misread': {
      regretLine: `热度高不是坏事，但你要把"热门"和"适合你"拆开看——前者是别人的判断，后者才跟你有关。`,
      mismatchLine: `去找2个在读学生，只看他们日常最痛苦的是什么。如果那个痛苦正好是你最不想扛的，热度再高也和你没关系。`
    },
    'stability-illusion': {
      regretLine: `它整体方向是稳的，这跟你对确定性的需求是一致的——但稳不代表轻松，门槛和分化是真的。`,
      mismatchLine: `你要提前看清的不是前景，而是它内部细分很多，学校、方向、城市不同，走出来的结果差别会很大。`
    },
    'interest-imagination-gap': {
      regretLine: `基于兴趣出发是对的，但兴趣需要落到真实日常里验证，不能只靠想象。`,
      mismatchLine: `去找${name}在读学生普通的一天——不是高光时刻，就是日常。如果日常让你觉得"和想的不一样"，这个信号要认真对待。`
    },
    'cost-tolerance-mismatch': {
      regretLine: `这条路接住了你最在意的东西，所以在你的清单里它排前面是合理的。`,
      mismatchLine: `前提是你先确认${cost}这件事你能不能长期接受——这是它最吃重的代价，别绕开。`
    },
    'path-ambiguity-anxiety': {
      regretLine: `这条路的前景没问题，但它内部细分差异很大——学校、方向、城市不同，走出来的结果差别会很大。`,
      mismatchLine: `前提是你愿意在过程中做更多自己的判断，而不是指望一条路自动把你送到终点。`
    }
  };

  // keep 卡：中性保留，不推不劝
  const keepCopy: Record<AdvisorMismatchType, { regretLine: string; mismatchLine: string }> = {
    'long-training-mismatch': {
      regretLine: `它需要较长培养周期，跟你的节奏偏好不完全合拍，但不代表它没价值。`,
      mismatchLine: `先把培养路径核实清楚，再决定要不要往前排。`
    },
    'hotness-misread': {
      regretLine: `热门背后有真实机会，也有被高估的部分——你现在还没到能分辨的阶段。`,
      mismatchLine: `先搞清楚它的日常学习压力和你的匹配度，再决定要不要认真考虑。`
    },
    'stability-illusion': {
      regretLine: `它看起来稳，但你还没核实这个"稳"的前提条件是什么。`,
      mismatchLine: `先查清真正的门槛、淘汰率和转行率，别用名头代替数据。`
    },
    'interest-imagination-gap': {
      regretLine: `你对它可能还停留在"听起来不错"的阶段，现在认定还太早。`,
      mismatchLine: `先找真实信息验证你的想象，看看日常跟你脑子里想的是不是一回事。`
    },
    'cost-tolerance-mismatch': {
      regretLine: `它在某些维度上确实有吸引力，但代价类型跟你不想扛的东西有重叠。`,
      mismatchLine: `先把代价列清楚，诚实判断你能不能长期接受，再决定排序。`
    },
    'path-ambiguity-anxiety': {
      regretLine: `这条路出来的人差异很大，不是所有人都走得顺——你需要更多信息才能判断自己属于哪一类。`,
      mismatchLine: `先去查最近两三届毕业生的真实去向，看看实际走向跟你预期差距大不大。`
    }
  };

  // avoid 卡：明确止损，不留暧昧
  const avoidCopy: Record<AdvisorMismatchType, { regretLine: string; mismatchLine: string }> = {
    'long-training-mismatch': {
      regretLine: `你以后最容易后悔的，不是${name}这条路太难，而是你明明对长周期投入已经很敏感了，却还是把它往前排。`,
      mismatchLine: `它的回报节奏和你现在能接受的投入周期正面撞上了——先别排，等你想清楚能不能接受长期延迟满足再说。`
    },
    'hotness-misread': {
      regretLine: `你以后最容易后悔的，不是没赶上${name}这趟车，而是把热度当成了适合度。`,
      mismatchLine: `它要求持续自我迭代和高压输出，这和你对学习压力的态度正好冲突——现在排太前对你不划算。`
    },
    'stability-illusion': {
      regretLine: `你以后最容易后悔的，不是没选"稳"的方向，而是把"看起来稳"当成了"自己读出来也会稳"。`,
      mismatchLine: `它的名声容易让人低估实际门槛——${cost}是绕不开的，先别急着往前排。`
    },
    'interest-imagination-gap': {
      regretLine: `你以后最容易后悔的，不是选了感兴趣的，而是选了"想象中感兴趣"的。`,
      mismatchLine: `它落到实际的日常跟你脑子里想的很可能不是一回事——先把想象和现实对齐，再考虑要不要排它。`
    },
    'cost-tolerance-mismatch': {
      regretLine: `你以后最容易后悔的，不是${name}本身，而是你明明知道最不想付的代价正好是"${cost}"，还是硬往前排。`,
      mismatchLine: `${name}最吃重的代价（${cost}）正好是你现在最抗拒承担的那一类——这个是硬冲突，不是能克服的。`
    },
    'path-ambiguity-anxiety': {
      regretLine: `你以后最容易后悔的，不是没敢冲，而是进了${name}以后才发现这条路比你想的更分化。`,
      mismatchLine: `它通往结果的路径不够直白——你越需要确定性，一个分化大的方向就越容易让你走到一半反复焦虑。现在先别碰，等看清楚了再说。`
    }
  };

  const fallback: Record<DirectionCardRole, { regretLine: string; mismatchLine: string }> = {
    push: pushCopy['path-ambiguity-anxiety'],
    keep: keepCopy['path-ambiguity-anxiety'],
    avoid: avoidCopy['path-ambiguity-anxiety']
  };

  const copyMap: Record<DirectionCardRole, Record<AdvisorMismatchType, { regretLine: string; mismatchLine: string }>> = {
    push: pushCopy,
    keep: keepCopy,
    avoid: avoidCopy
  };

  return copyMap[role][type] ?? fallback[role];
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
    decisionLine: roleDecisionTemplates[role](direction.title.replace(/类$/u, ''), input),
    attractionLine: buildAttractionLine(relation, input, direction),
    ...mismatchLines(mismatchType, direction, input, role),
    mismatchType
  };
}
