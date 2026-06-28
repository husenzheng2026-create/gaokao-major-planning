import { render, screen } from '@testing-library/react';

import XhsEntryPage from '@/app/xhs/page';

describe('XhsEntryPage', () => {
  it('explains the paid diagnostic and links into the dedicated questionnaire', () => {
    render(<XhsEntryPage />);

    expect(
      screen.getByRole('heading', { name: '高考专业方向轻诊断' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/这是你购买后的正式诊断入口，不是公开体验版/)
    ).toBeInTheDocument();
    expect(screen.getByText(/预计 5 到 8 分钟完成/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '开始正式诊断' })
    ).toHaveAttribute('href', '/xhs/questionnaire');
  });
});
