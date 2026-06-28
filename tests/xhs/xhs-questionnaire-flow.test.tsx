import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import XhsQuestionnairePage from '@/app/xhs/questionnaire/page';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn()
  })
}));

describe('Xhs questionnaire flow', () => {
  beforeEach(() => {
    push.mockReset();
  });

  it('labels the questionnaire as the paid diagnostic flow', () => {
    const { container } = render(<XhsQuestionnairePage />);

    expect(screen.getByText(/购买后正式诊断/)).toBeInTheDocument();
    expect(screen.getByText(/完成后会直接生成你的方向判断/)).toBeInTheDocument();
    expect(container.querySelector('main')).toHaveClass('max-w-3xl', 'py-6', 'md:max-w-4xl');
    expect(screen.getByText(/购买后正式诊断/).closest('section')).toHaveClass(
      'px-4',
      'py-5',
      'sm:px-5',
      'md:px-6'
    );
    expect(
      screen.getByRole('heading', { name: '这一轮只帮你做一件事：先把方向范围缩小。' })
    ).toHaveClass('text-xl', 'sm:text-2xl');
  });

  it('navigates to xhs report with encoded answers after the last step', async () => {
    const user = userEvent.setup();
    render(<XhsQuestionnairePage />);

    await user.click(screen.getByLabelText('计算机、数据与人工智能类'));
    await user.click(screen.getByLabelText('财经管理类'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('计算机、数据与人工智能类'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('财经管理类'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('未来发展空间'));
    await user.click(screen.getByLabelText('就业稳定'));
    await user.click(screen.getByLabelText('兴趣匹配'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('未来发展空间'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('就业稳定'));
    await user.click(screen.getByLabelText('社会认可度'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('必须长期读研或继续深造'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    const parentRiskPrompt =
      screen.queryByRole('heading', { name: '家长最不能接受哪类风险？' }) ??
      screen.getByRole('heading', {
        name: '如果家长会明确反对，他们最可能卡在哪类风险上？'
      });
    expect(parentRiskPrompt).toBeInTheDocument();

    await user.click(screen.getByLabelText('行业波动大'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('看情况'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('有压力但可考虑'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('不想高压加班'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('希望空间大、成长快'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    await user.click(screen.getByLabelText('逻辑分析与解题'));
    await user.click(screen.getByRole('button', { name: '生成正式结果' }));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0][0]).toMatch(/^\/xhs\/report\?answers=/);
  });
});
