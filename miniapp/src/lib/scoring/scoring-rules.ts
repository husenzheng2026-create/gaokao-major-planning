// 高考专业方向决策辅助工具 - 评分规则表
// 8 个决策因素对 8 维客观字段的权重映射
// 数值越大表示该因素越倾向该字段取"高"分；负值表示该因素越倾向该字段取"低"分
// 文案与取值遵守合规边界,不使用"最适合/最优解/精准匹配"等被禁词

import type { MajorChoiceArchetype } from '@/types/assessment';

export const factorWeightMap = {
  兴趣匹配: { growthPotential: 2, pathClarity: 1 },
  就业稳定: { jobBreadth: 2, industryVolatility: -2, pathClarity: 2 },
  收入潜力: { growthPotential: 2, platformDependency: 1 },
  社会认可度: { pathClarity: 1, advancedDegreeDependency: 1 },
  学习过程不要太痛苦: { studyPressure: -2 },
  未来发展空间: { growthPotential: 3 },
  城市机会: { cityConcentration: 1, jobBreadth: 1 },
  继续深造价值: { advancedDegreeDependency: 2 }
} as const;

// 5 类专业选择人格的显式信号权重。
// 只使用现有问卷字段,用于生成可解释的人格判定结果。
export const archetypeSignalWeightMap: Record<
  MajorChoiceArchetype,
  {
    topFactors?: Partial<Record<keyof typeof factorWeightMap, number>>;
    nonNegotiableFactor?: Partial<Record<keyof typeof factorWeightMap, number>>;
    futurePath?: Partial<
      Record<
        | '尽快就业'
        | '本科后再看'
        | '接受继续深造'
        | '希望路径稳定清晰'
        | '希望空间大、成长快',
        number
      >
    >;
    longTermTradeoffAcceptance?: Partial<Record<'接受' | '看情况' | '不太接受', number>>;
    trainingCycleAcceptance?: Partial<Record<'接受' | '有压力但可考虑' | '不太接受', number>>;
    learningStyle?: Partial<
      Record<'理论阅读和记忆' | '逻辑分析与解题' | '动手实验与实操' | '表达沟通与协作' | '暂时不确定', number>
    >;
    rejectedRisks?: Partial<
      Record<
        | '课程难度高、学习压力大'
        | '必须长期读研或继续深造'
        | '就业面比较窄'
        | '工作强度高'
        | '行业波动大'
        | '强依赖证书或考试'
        | '强依赖资源、城市或人脉',
        number
      >
    >;
  }
> = {
  '稳中求进型': {
    topFactors: {
      未来发展空间: 2,
      就业稳定: 2,
      兴趣匹配: 1
    },
    nonNegotiableFactor: {
      未来发展空间: 2,
      就业稳定: 2
    },
    futurePath: {
      '希望路径稳定清晰': 2,
      '希望空间大、成长快': 1,
      '尽快就业': 1
    },
    longTermTradeoffAcceptance: {
      看情况: 2,
      接受: 1
    },
    trainingCycleAcceptance: {
      有压力但可考虑: 2,
      接受: 1
    },
    rejectedRisks: {
      行业波动大: 1,
      必须长期读研或继续深造: 1
    }
  },
  '成长优先型': {
    topFactors: {
      未来发展空间: 3,
      收入潜力: 2,
      兴趣匹配: 1
    },
    nonNegotiableFactor: {
      未来发展空间: 4
    },
    futurePath: {
      '希望空间大、成长快': 4,
      '接受继续深造': 2
    },
    longTermTradeoffAcceptance: {
      接受: 2,
      看情况: 1
    },
    trainingCycleAcceptance: {
      接受: 2,
      有压力但可考虑: 1
    },
    learningStyle: {
      逻辑分析与解题: 1,
      动手实验与实操: 1
    }
  },
  '低后悔成本型': {
    topFactors: {
      学习过程不要太痛苦: 2,
      就业稳定: 1,
      兴趣匹配: 1
    },
    futurePath: {
      '本科后再看': 4,
      '尽快就业': 1
    },
    longTermTradeoffAcceptance: {
      不太接受: 2,
      看情况: 1
    },
    trainingCycleAcceptance: {
      不太接受: 3,
      有压力但可考虑: 1
    },
    rejectedRisks: {
      必须长期读研或继续深造: 2,
      就业面比较窄: 2,
      '强依赖资源、城市或人脉': 2
    }
  },
  '现实安全型': {
    topFactors: {
      就业稳定: 3,
      社会认可度: 2,
      学习过程不要太痛苦: 1
    },
    nonNegotiableFactor: {
      就业稳定: 4,
      学习过程不要太痛苦: 1
    },
    futurePath: {
      '希望路径稳定清晰': 4,
      '尽快就业': 2
    },
    longTermTradeoffAcceptance: {
      不太接受: 2,
      看情况: 1
    },
    trainingCycleAcceptance: {
      不太接受: 3,
      有压力但可考虑: 1
    },
    rejectedRisks: {
      行业波动大: 3,
      必须长期读研或继续深造: 2,
      工作强度高: 1
    }
  },
  '兴趣摇摆型': {
    topFactors: {
      兴趣匹配: 3,
      未来发展空间: 1,
      就业稳定: 1
    },
    nonNegotiableFactor: {
      兴趣匹配: 3
    },
    futurePath: {
      '本科后再看': 2
    },
    longTermTradeoffAcceptance: {
      看情况: 1
    },
    learningStyle: {
      暂时不确定: 4
    }
  }
} as const;

export const archetypePriorityOrder: MajorChoiceArchetype[] = [
  '成长优先型',
  '现实安全型',
  '稳中求进型',
  '低后悔成本型',
  '兴趣摇摆型'
];

// 客观字段枚举值到 0/1/2 分的映射
// 高/宽/清晰 = 2，中等/中 = 1，低/窄/分化明显 = 0
export type EnumValue =
  | '高'
  | '中'
  | '低'
  | '宽'
  | '中等'
  | '窄'
  | '清晰'
  | '分化明显';

export function enumToScore(value: EnumValue): number {
  if (value === '高' || value === '宽' || value === '清晰') {
    return 2;
  }
  if (value === '中' || value === '中等') {
    return 1;
  }
  return 0;
}
