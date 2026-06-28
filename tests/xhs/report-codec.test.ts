import type { QuestionnaireInput } from '@/lib/scoring/build-report';
import { decodeReportInputFromToken, encodeReportInputToToken } from '@/lib/report/report-codec';

const validPayload: QuestionnaireInput = {
  selectedDirections: ['cs-ai', 'engineering-auto', 'finance-management'],
  selfPreferredDirections: ['cs-ai'],
  parentPreferredDirections: ['finance-management'],
  topFactors: ['未来发展空间', '就业稳定', '兴趣匹配'],
  nonNegotiableFactor: '未来发展空间',
  parentTopFactors: ['就业稳定', '社会认可度'],
  rejectedRisks: ['必须长期读研或继续深造'],
  parentRejectedRisks: ['行业波动大'],
  longTermTradeoffAcceptance: '看情况',
  learningStyle: '逻辑分析与解题',
  futurePath: '希望空间大、成长快',
  trainingCycleAcceptance: '有压力但可考虑',
  unwantedWorkStyles: ['不想高压加班']
};

describe('report codec', () => {
  it('round-trips questionnaire payloads through a URL-safe token', () => {
    const token = encodeReportInputToToken(validPayload);

    expect(token).not.toMatch(/[+/=]/);
    expect(decodeReportInputFromToken(token)).toEqual(validPayload);
  });

  it('returns null for malformed tokens', () => {
    expect(decodeReportInputFromToken('not-a-real-token')).toBeNull();
  });
});
