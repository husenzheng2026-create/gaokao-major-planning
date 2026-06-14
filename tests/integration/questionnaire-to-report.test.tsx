// 问卷到报告联通测试（Task 7 Step 1）
// 目标：验证问卷提交后能跳到下一步，并最终把结果写入 sessionStorage
// 范围：本次只验证第一步选项 → 下一步 → 第二题标题出现
// 不需要跑完整个 12 题流程

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

describe('questionnaire to report flow', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('advances to the second step after selecting two direction groups', async () => {
    const user = userEvent.setup();
    render(<QuestionnairePage />);

    // 第一题：候选方向组
    await user.click(screen.getByLabelText('计算机、数据与人工智能类'));
    await user.click(screen.getByLabelText('财经管理类'));

    const nextButton = screen.getByRole('button', { name: '下一步' });
    expect(nextButton).toBeEnabled();

    await user.click(nextButton);

    // 第二题：决策权重模块
    expect(
      screen.getByRole('heading', { name: '你更想自己选的方向是哪些？' })
    ).toBeInTheDocument();
  });
});
