import { render, screen } from '@testing-library/react';

import XhsReportPage from '@/app/xhs/report/page';

let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams
}));

const validPayload = {
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

function encodePayload(payload: typeof validPayload) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

describe('XhsReportPage', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
  });

  it('renders a share-safe report from encoded answers', async () => {
    mockSearchParams = new URLSearchParams({
      answers: encodePayload(validPayload)
    });

    const { container } = render(<XhsReportPage />);

    expect(
      await screen.findByRole('heading', { name: '你的方向判断已经出来了' })
    ).toBeInTheDocument();
    expect(screen.getByText('现在优先押')).toBeInTheDocument();
    expect(screen.getByText('可以留着')).toBeInTheDocument();
    expect(screen.getByText('先别碰')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '接下来 48 小时只做这两步' })).toBeInTheDocument();
    expect(container.querySelector('main')).toHaveClass('px-4', 'py-6', 'md:py-10');
    expect(
      screen.getByRole('heading', { name: '你的方向判断已经出来了' })
    ).toHaveClass('text-2xl', 'md:text-4xl');
    expect(screen.getByText('现在优先押').closest('section')).toHaveClass('gap-3', 'md:grid-cols-3');
  });

  it('shows recovery guidance when encoded answers are missing', async () => {
    render(<XhsReportPage />);

    expect(screen.getByText('无法读取本次诊断结果')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '重新开始正式诊断' })
    ).toHaveAttribute('href', '/xhs');
  });
});
