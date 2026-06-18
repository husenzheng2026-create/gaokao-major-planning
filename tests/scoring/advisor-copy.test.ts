import { describe, expect, it } from 'vitest';

import { directionGroups } from '@/data/direction-groups';
import {
  buildAdvisorCard,
  detectDirectionRelation,
  detectMismatchType,
  type DirectionCardRole
} from '@/lib/scoring/advisor-copy';
import type { QuestionnaireInput } from '@/lib/scoring/build-report';

const medical = directionGroups.find((group) => group.id === 'medical-health')!;
const csAi = directionGroups.find((group) => group.id === 'cs-ai')!;

const longCycleInput: QuestionnaireInput = {
  selectedDirections: ['medical-health', 'education', 'finance-management'],
  selfPreferredDirections: ['medical-health'],
  parentPreferredDirections: ['education'],
  topFactors: ['就业稳定', '学习过程不要太痛苦', '兴趣匹配'],
  nonNegotiableFactor: '学习过程不要太痛苦',
  parentTopFactors: ['就业稳定', '社会认可度'],
  rejectedRisks: ['必须长期读研或继续深造'],
  parentRejectedRisks: ['行业波动大'],
  longTermTradeoffAcceptance: '不太接受',
  learningStyle: '表达沟通与协作',
  futurePath: '希望路径稳定清晰',
  trainingCycleAcceptance: '不太接受',
  unwantedWorkStyles: ['不想高压加班']
};

const hotnessInput: QuestionnaireInput = {
  selectedDirections: ['cs-ai', 'engineering-auto', 'finance-management'],
  selfPreferredDirections: ['cs-ai'],
  parentPreferredDirections: ['finance-management'],
  topFactors: ['未来发展空间', '就业稳定', '兴趣匹配'],
  nonNegotiableFactor: '未来发展空间',
  parentTopFactors: ['就业稳定', '社会认可度'],
  rejectedRisks: ['课程难度高、学习压力大'],
  parentRejectedRisks: ['行业波动大'],
  longTermTradeoffAcceptance: '不太接受',
  learningStyle: '逻辑分析与解题',
  futurePath: '希望空间大、成长快',
  trainingCycleAcceptance: '有压力但可考虑',
  unwantedWorkStyles: ['不想高压加班']
};

describe('advisor-copy', () => {
  it('detects long-training mismatch for users who reject long study cycles', () => {
    expect(detectMismatchType(longCycleInput, medical)).toBe('long-training-mismatch');
  });

  it('detects hotness or cost mismatch for growth-chasing users under pressure aversion', () => {
    expect(['hotness-misread', 'cost-tolerance-mismatch']).toContain(
      detectMismatchType(hotnessInput, csAi)
    );
  });

  it('builds four-line advisor copy with role-specific tone', () => {
    const relation = detectDirectionRelation(longCycleInput, medical.id);
    const card = buildAdvisorCard('avoid' satisfies DirectionCardRole, 'long-training-mismatch', longCycleInput, medical, relation);

    expect(card.decisionLine).toMatch(/先别|对你不划算/u);
    expect(card.attractionLine).toMatch(/你自己|家长|放进清单/u);
    expect(card.regretLine).toMatch(/后悔/u);
    expect(card.mismatchLine).toMatch(/回报节奏|投入周期|撞上|不是|代价/u);
  });

  // 防回归：未被标记为"自己选"或"家长推"的方向，默认应为 exploring，不判为热度驱动
  it('defaults to exploring relation instead of hotness-driven', () => {
    // engineering-auto 在 hotnessInput 中既不是 selfPreferred 也不是 parentPreferred
    const engineering = directionGroups.find((g) => g.id === 'engineering-auto')!;
    expect(detectDirectionRelation(hotnessInput, engineering.id)).toBe('exploring');
  });
});
