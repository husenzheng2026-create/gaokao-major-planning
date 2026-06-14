// 问卷题库配置：固定核心题 + 动态题组
// 首版目标不是做复杂自适应测评，而是避免每次都出现完全相同的后半程题流

export const factorOptions = [
  '兴趣匹配',
  '就业稳定',
  '收入潜力',
  '社会认可度',
  '学习过程不要太痛苦',
  '未来发展空间',
  '城市机会',
  '继续深造价值'
] as const;

export const riskOptions = [
  '课程难度高、学习压力大',
  '必须长期读研或继续深造',
  '就业面比较窄',
  '工作强度高',
  '行业波动大',
  '强依赖证书或考试',
  '强依赖资源、城市或人脉'
] as const;

export const directionTitles = [
  '计算机、数据与人工智能类',
  '工程、自动化与智能制造类',
  '医学与健康服务类',
  '财经管理类',
  '法学与公共事务类',
  '教育与师范类',
  '传媒、内容与传播类',
  '设计与艺术应用类',
  '基础学科与科研潜力类',
  '人文社科与语言类'
] as const;

export const longTermTradeoffOptions = ['接受', '看情况', '不太接受'] as const;
export const learningStyleOptions = [
  '理论阅读和记忆',
  '逻辑分析与解题',
  '动手实验与实操',
  '表达沟通与协作',
  '暂时不确定'
] as const;
export const futurePathOptions = [
  '尽快就业',
  '本科后再看',
  '接受继续深造',
  '希望路径稳定清晰',
  '希望空间大、成长快'
] as const;
export const trainingCycleOptions = ['接受', '有压力但可考虑', '不太接受'] as const;
export const unwantedWorkStyleOptions = [
  '不想高压加班',
  '不想长期考试考证',
  '不想进高度不稳定行业',
  '不想做强社交型工作',
  '不想做强销售型工作'
] as const;

export const fixedCoreQuestionIds = [
  'selectedDirections',
  'selfPreferredDirections',
  'parentPreferredDirections',
  'topFactors',
  'nonNegotiableFactor',
  'parentTopFactors',
  'rejectedRisks'
] as const;

export const dynamicQuestionIds = [
  'parentRejectedRisks',
  'longTermTradeoffAcceptance',
  'learningStyle',
  'futurePath',
  'trainingCycleAcceptance',
  'unwantedWorkStyles'
] as const;

export type QuestionnaireQuestionId =
  | (typeof fixedCoreQuestionIds)[number]
  | (typeof dynamicQuestionIds)[number];

export type QuestionType = 'multi-select' | 'single-select';

export interface QuestionConfig {
  id: QuestionnaireQuestionId;
  type: QuestionType;
  title: string;
  description?: string;
  options: readonly string[];
  min?: number;
  max?: number;
}

export interface QuestionnaireFlowAnswers {
  selectedDirections?: string[];
  selfPreferredDirections?: string[];
  parentPreferredDirections?: string[];
  topFactors?: string[];
  nonNegotiableFactor?: string;
  rejectedRisks?: string[];
}

const longCycleDirections = new Set([
  '医学与健康服务类',
  '基础学科与科研潜力类',
  '法学与公共事务类'
]);

const volatileDirections = new Set([
  '传媒、内容与传播类',
  '设计与艺术应用类',
  '财经管理类',
  '计算机、数据与人工智能类'
]);

const questionBank: Record<QuestionnaireQuestionId, Omit<QuestionConfig, 'title' | 'description'> & {
  variants: Array<{ title: string; description?: string }>;
}> = {
  selectedDirections: {
    id: 'selectedDirections',
    type: 'multi-select',
    options: directionTitles,
    min: 2,
    max: 5,
    variants: [
      {
        title: '你目前最想重点了解哪些专业方向组？',
        description: '选择 2 到 5 个方向，越具体越有助于后续比较。'
      }
    ]
  },
  selfPreferredDirections: {
    id: 'selfPreferredDirections',
    type: 'multi-select',
    options: directionTitles,
    variants: [
      {
        title: '你更想自己选的方向是哪些？',
        description: '可以与下面家长希望的方向不同，便于识别分歧。'
      }
    ]
  },
  parentPreferredDirections: {
    id: 'parentPreferredDirections',
    type: 'multi-select',
    options: directionTitles,
    variants: [
      {
        title: '家长更希望你考虑的方向是哪些？',
        description: '如果还没沟通过，可以根据家长过往表达做合理估计。'
      }
    ]
  },
  topFactors: {
    id: 'topFactors',
    type: 'multi-select',
    options: factorOptions,
    min: 3,
    max: 3,
    variants: [
      {
        title: '你做选择时最看重哪 3 项？',
        description: '从中选出 3 项，按对你重要程度选择即可。'
      }
    ]
  },
  nonNegotiableFactor: {
    id: 'nonNegotiableFactor',
    type: 'single-select',
    options: factorOptions,
    variants: [
      {
        title: '如果只能保住 1 项，你最不能放弃的是哪一项？'
      }
    ]
  },
  parentTopFactors: {
    id: 'parentTopFactors',
    type: 'multi-select',
    options: factorOptions,
    min: 2,
    max: 2,
    variants: [
      {
        title: '你觉得家长最看重的是哪 2 项？'
      }
    ]
  },
  rejectedRisks: {
    id: 'rejectedRisks',
    type: 'multi-select',
    options: riskOptions,
    min: 1,
    variants: [
      {
        title: '你最不能接受哪几类代价？',
        description: '至少选 1 项，多选用于识别你的真实底线。'
      }
    ]
  },
  parentRejectedRisks: {
    id: 'parentRejectedRisks',
    type: 'multi-select',
    options: riskOptions,
    min: 1,
    variants: [
      {
        title: '家长最不能接受哪类风险？',
        description: '这一题用于识别你和家长到底是在担心同一件事，还是担心的不是一回事。'
      },
      {
        title: '如果家长会明确反对，他们最可能卡在哪类风险上？',
        description: '不是问家长喜欢什么，而是问家长最怕什么。'
      }
    ]
  },
  longTermTradeoffAcceptance: {
    id: 'longTermTradeoffAcceptance',
    type: 'single-select',
    options: longTermTradeoffOptions,
    variants: [
      {
        title: '你是否接受「前期更辛苦，但后期空间更大」的路径？'
      },
      {
        title: '如果一个方向前几年更累，但后面上升空间更大，你能接受吗？'
      }
    ]
  },
  learningStyle: {
    id: 'learningStyle',
    type: 'single-select',
    options: learningStyleOptions,
    variants: [
      {
        title: '你更适应哪种学习方式？'
      },
      {
        title: '下面哪种学习节奏，通常更像你的真实状态？'
      }
    ]
  },
  futurePath: {
    id: 'futurePath',
    type: 'single-select',
    options: futurePathOptions,
    variants: [
      {
        title: '你更倾向哪种未来路径？'
      },
      {
        title: '如果只看毕业后 5 年，你更想走哪种节奏？'
      }
    ]
  },
  trainingCycleAcceptance: {
    id: 'trainingCycleAcceptance',
    type: 'single-select',
    options: trainingCycleOptions,
    variants: [
      {
        title: '家庭是否接受较长培养周期？'
      },
      {
        title: '如果一个方向需要更长时间才能看到回报，家庭能接受吗？'
      }
    ]
  },
  unwantedWorkStyles: {
    id: 'unwantedWorkStyles',
    type: 'multi-select',
    options: unwantedWorkStyleOptions,
    variants: [
      {
        title: '是否有明确不考虑的生活方式或职业状态？',
        description: '可以多选，也可以一项都不选。'
      },
      {
        title: '哪些工作状态你现在就很确定自己不想要？',
        description: '这里不是判断你能不能吃苦，而是先划清明显不想要的生活边界。'
      }
    ]
  }
};

function hashString(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function variantIndex(seed: number, id: QuestionnaireQuestionId): number {
  return hashString(`${seed}:${id}:variant`);
}

function sortKey(seed: number, id: QuestionnaireQuestionId): number {
  return hashString(`${seed}:${id}:order`);
}

function createQuestion(id: QuestionnaireQuestionId, seed: number): QuestionConfig {
  const config = questionBank[id];
  const picked = config.variants[variantIndex(seed, id) % config.variants.length];

  return {
    id: config.id,
    type: config.type,
    options: config.options,
    min: config.min,
    max: config.max,
    title: picked.title,
    description: picked.description
  };
}

function overlapCount(left: string[] = [], right: string[] = []): number {
  const rightSet = new Set(right);
  return left.filter((item) => rightSet.has(item)).length;
}

function selectedHas(set: Set<string>, titles: string[] = []): boolean {
  return titles.some((title) => set.has(title));
}

function dynamicPriority(
  id: (typeof dynamicQuestionIds)[number],
  answers: QuestionnaireFlowAnswers
): number {
  const selectedDirections = answers.selectedDirections ?? [];
  const rejectedRisks = answers.rejectedRisks ?? [];
  const selfDirections = answers.selfPreferredDirections ?? [];
  const parentDirections = answers.parentPreferredDirections ?? [];
  const nonNegotiableFactor = answers.nonNegotiableFactor ?? '';
  const overlap = overlapCount(selfDirections, parentDirections);

  switch (id) {
    case 'parentRejectedRisks':
      return overlap === 0 ? 30 : overlap === 1 ? 18 : 8;
    case 'trainingCycleAcceptance':
      return (
        (selectedHas(longCycleDirections, selectedDirections) ? 24 : 10) +
        (rejectedRisks.includes('必须长期读研或继续深造') ? 6 : 0)
      );
    case 'longTermTradeoffAcceptance':
      return (
        (nonNegotiableFactor === '未来发展空间' ? 18 : 9) +
        (selectedHas(longCycleDirections, selectedDirections) ? 3 : 0)
      );
    case 'futurePath':
      return (
        (nonNegotiableFactor === '就业稳定' ? 17 : 12) +
        (rejectedRisks.includes('就业面比较窄') ? 3 : 0)
      );
    case 'unwantedWorkStyles':
      return (
        (selectedHas(volatileDirections, selectedDirections) ? 16 : 10) +
        (rejectedRisks.includes('行业波动大') ? 4 : 0) +
        (rejectedRisks.includes('工作强度高') ? 4 : 0)
      );
    case 'learningStyle':
      return selectedDirections.length >= 4 ? 14 : 11;
    default:
      return 0;
  }
}

export function buildQuestionnaireFlow({
  seed = 0,
  answers = {}
}: {
  seed?: number;
  answers?: QuestionnaireFlowAnswers;
} = {}): QuestionConfig[] {
  const fixedQuestions = fixedCoreQuestionIds.map((id) => createQuestion(id, seed));
  const dynamicQuestions = [...dynamicQuestionIds]
    .sort((left, right) => {
      const priorityGap = dynamicPriority(right, answers) - dynamicPriority(left, answers);
      if (priorityGap !== 0) {
        return priorityGap;
      }
      return sortKey(seed, left) - sortKey(seed, right);
    })
    .map((id) => createQuestion(id, seed));

  return [...fixedQuestions, ...dynamicQuestions];
}
