import { z } from 'zod';
import { factorOptions, riskOptions } from '@/data/questionnaire';
import { directionGroupIds } from '@/types/assessment';

// 问卷输入统一 schema：用于前端校验与服务端二次校验
export const questionnaireSchema = z.object({
  selectedDirections: z.array(z.enum(directionGroupIds)).min(2).max(5),
  selfPreferredDirections: z.array(z.enum(directionGroupIds)),
  parentPreferredDirections: z.array(z.enum(directionGroupIds)),
  topFactors: z.array(z.enum(factorOptions)).min(3).max(3),
  nonNegotiableFactor: z.enum(factorOptions),
  parentTopFactors: z.array(z.enum(factorOptions)).min(2).max(2),
  rejectedRisks: z.array(z.enum(riskOptions)).min(1),
  parentRejectedRisks: z.array(z.enum(riskOptions)).min(1),
  longTermTradeoffAcceptance: z.enum(['接受', '看情况', '不太接受']),
  learningStyle: z.enum([
    '理论阅读和记忆',
    '逻辑分析与解题',
    '动手实验与实操',
    '表达沟通与协作',
    '暂时不确定'
  ]),
  futurePath: z.enum([
    '尽快就业',
    '本科后再看',
    '接受继续深造',
    '希望路径稳定清晰',
    '希望空间大、成长快'
  ]),
  trainingCycleAcceptance: z.enum(['接受', '有压力但可考虑', '不太接受']),
  unwantedWorkStyles: z.array(z.string())
});
