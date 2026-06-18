// ReportPage 在挂载后会从 sessionStorage 读取问卷输入并动态调用 buildReport。
// 首次 render 是 loading 态，3 个 heading 需等 useEffect 跑完后才出现。
// 此测试在 beforeEach 注入一份合法问卷输入，断言改用 findBy* 等待 ready 态。

import { render, screen } from '@testing-library/react';
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

// 防回归：只选 2 个方向时，不应凭空出现"先别碰"卡片
const twoDirectionPayload = {
  ...validPayload,
  selectedDirections: ['cs-ai', 'engineering-auto'] as string[]
};

describe('ReportPage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(validPayload));
  });

  it('renders archetype hero, recommendation tiers and compact next actions', async () => {
    render(<ReportPage />);

    expect(
      await screen.findByRole('heading', { name: '一句话判断' })
    ).toBeInTheDocument();
    expect(
      await screen.findByText('现在优先押')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('可以留着')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('先别碰')
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: '为什么我会这样劝你' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: '你最容易后悔的点' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /接下来 48 小时，只做这.[刀]/ })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: '客观现实层' })
    ).toBeInTheDocument();
    expect(
      (await screen.findAllByText('就业面宽度')).length
    ).toBeGreaterThan(0);
    expect(
      (await screen.findAllByText(/数据依据来自教育部、阳光高考、国家统计局/)).length
    ).toBeGreaterThan(0);
    expect(
      await screen.findByText(/本工具用于专业方向决策辅助/)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/不承诺录取结果、就业结果、薪资结果/)
    ).toBeInTheDocument();
    expect(
      (await screen.findAllByText(/你自己|家长把|放进清单/u)).length
    ).toBeGreaterThan(0);
    expect(
      (await screen.findAllByText(/后悔/u)).length
    ).toBeGreaterThan(0);
  });

  // 防回归：只选 2 个方向时，holdRecommendation 返回 undefined，页面不应出现"先别碰"
  it('does not show avoid card when only two directions are selected', async () => {
    window.sessionStorage.clear();
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(twoDirectionPayload));
    render(<ReportPage />);

    await screen.findByRole('heading', { name: '一句话判断' });

    expect(screen.queryByText('先别碰')).not.toBeInTheDocument();
    expect(screen.getByText('现在优先押')).toBeInTheDocument();
    expect(screen.getByText('可以留着')).toBeInTheDocument();
  });
});
