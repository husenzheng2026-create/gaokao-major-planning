import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the product title and CTA', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: '高考专业方向决策辅助工具' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '开始 8-12 分钟诊断' })
    ).toBeInTheDocument();
  });
});
