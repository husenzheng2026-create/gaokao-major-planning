import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import ReportPage from '@/app/report/page';

const STORAGE_KEY = 'major-direction-report-input';

const validPayload = {
  selectedDirections: ['cs-ai', 'engineering-auto', 'finance-management'],
  selfPreferredDirections: ['cs-ai'],
  parentPreferredDirections: ['finance-management'],
  topFactors: ['未来发展空间', '就业稳定', '兴趣匹配'],
  nonNegotiableFactor: '未来发展空间',
  parentTopFactors: ['就业稳定', '社会认可度'],
  rejectedRisks: ['行业波动大'],
  parentRejectedRisks: ['必须长期读研或继续深造'],
  longTermTradeoffAcceptance: '看情况',
  learningStyle: '逻辑分析与解题',
  futurePath: '希望空间大、成长快',
  trainingCycleAcceptance: '有压力但可考虑',
  unwantedWorkStyles: ['不想高压加班']
};

describe('compliance disclaimers', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(validPayload));
  });

  it('shows decision-support disclaimer on homepage', () => {
    render(<HomePage />);
    expect(
      screen.getByText(/本工具用于辅助判断，不替代官方招生信息和最终志愿决策/)
    ).toBeInTheDocument();
  });

  it('shows non-guarantee disclaimer on report page', async () => {
    render(<ReportPage />);
    expect(
      await screen.findByText(/不承诺录取结果、就业结果、薪资结果/)
    ).toBeInTheDocument();
  });
});
