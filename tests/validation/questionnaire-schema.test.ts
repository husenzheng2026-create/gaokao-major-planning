import { questionnaireSchema } from '@/lib/validation/questionnaire-schema';

describe('questionnaireSchema', () => {
  it('accepts a valid assessment payload', () => {
    const result = questionnaireSchema.safeParse({
      selectedDirections: ['cs-ai', 'finance-management'],
      selfPreferredDirections: ['cs-ai'],
      parentPreferredDirections: ['finance-management'],
      topFactors: ['兴趣匹配', '未来发展空间', '就业稳定'],
      nonNegotiableFactor: '未来发展空间',
      parentTopFactors: ['就业稳定', '社会认可度'],
      rejectedRisks: ['行业波动大'],
      parentRejectedRisks: ['必须长期读研或继续深造'],
      longTermTradeoffAcceptance: '看情况',
      learningStyle: '逻辑分析与解题',
      futurePath: '希望空间大、成长快',
      trainingCycleAcceptance: '有压力但可考虑',
      unwantedWorkStyles: ['不想高压加班']
    });

    expect(result.success).toBe(true);
  });
});
