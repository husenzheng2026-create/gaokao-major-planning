import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import QuestionnairePage from '@/app/questionnaire/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn()
  })
}));

describe('QuestionnairePage', () => {
  it('scrolls the next question into view after advancing', async () => {
    const user = userEvent.setup();
    const scrollIntoViewSpy = vi.fn();

    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewSpy
    });

    render(<QuestionnairePage />);

    await user.click(screen.getByLabelText('计算机、数据与人工智能类'));
    await user.click(screen.getByLabelText('财经管理类'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    expect(
      await screen.findByRole('heading', { name: '你更想自己选的方向是哪些？' })
    ).toBeInTheDocument();
    expect(scrollIntoViewSpy).toHaveBeenCalled();
  });

  it('renders the first step heading and keeps next disabled before selection', () => {
    render(<QuestionnairePage />);

    expect(
      screen.getByRole('heading', { name: '你目前最想重点了解哪些专业方向组？' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('计算机、数据与人工智能类').closest('div')).toHaveClass(
      'sm:grid-cols-2'
    );
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled();
  });

  it('enables the next button after selecting two direction groups', async () => {
    const user = userEvent.setup();
    render(<QuestionnairePage />);

    const csAi = screen.getByLabelText('计算机、数据与人工智能类');
    const finance = screen.getByLabelText('财经管理类');

    await user.click(csAi);
    await user.click(finance);

    expect(screen.getByRole('button', { name: '下一步' })).toBeEnabled();
  });
});
