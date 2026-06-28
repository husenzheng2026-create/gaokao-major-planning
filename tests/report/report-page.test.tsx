// ReportPage v2 测试 — 叙事流渲染
// 旧测试：查找分块标题（"先看结论"、"现实提醒"等）和卡片标签（"现在优先押"等）
// 新测试：验证叙事段落渲染、TL;DR 摘要、行动建议列表、合规提示

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
  rejectedRisks: ['必须长期读研或继续深造'],
  parentRejectedRisks: ['行业波动大'],
  longTermTradeoffAcceptance: '看情况',
  learningStyle: '逻辑分析与解题',
  futurePath: '希望空间大、成长快',
  trainingCycleAcceptance: '有压力但可考虑',
  unwantedWorkStyles: ['不想高压加班']
};

const twoDirectionPayload = {
  ...validPayload,
  selectedDirections: ['cs-ai', 'engineering-auto'] as unknown as typeof validPayload.selectedDirections
};

describe('ReportPage v2 — narrative rendering', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(validPayload));
  });

  it('renders narrative paragraphs instead of sectioned cards', async () => {
    render(<ReportPage />);

    // 叙事文本应包含人格标签
    expect(await screen.findByText('结论')).toBeInTheDocument();

    // 叙事段落在页面上（"计算机"在多个元素中出现，用 getAllByText）
    const computerElements = await screen.findAllByText(/计算机/);
    expect(computerElements.length).toBeGreaterThanOrEqual(2); // TL;DR + 至少1个叙事段落

    // TL;DR 摘要块
    expect(await screen.findByText('结论')).toBeInTheDocument();

    // 行动建议列表仍然存在
    expect(await screen.findByRole('heading', { name: '接下来只做两步' })).toBeInTheDocument();

    // 合规提示
    expect(await screen.findByText(/本工具用于专业方向决策辅助/)).toBeInTheDocument();
    expect(await screen.findByText(/不承诺录取结果、就业结果、薪资结果/)).toBeInTheDocument();
  });

  it('does not render old section headings', async () => {
    render(<ReportPage />);

    await screen.findByText('结论');

    // 旧标题不应存在
    expect(screen.queryByRole('heading', { name: '一句话判断' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '先看结论' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '现实提醒' })).not.toBeInTheDocument();

    // 旧卡片标签不应存在
    expect(screen.queryByText('现在优先押')).not.toBeInTheDocument();
    expect(screen.queryByText('可以留着')).not.toBeInTheDocument();
    expect(screen.queryByText('先别碰')).not.toBeInTheDocument();

    // 旧结论卡片不应存在
    expect(screen.queryByText('你更适合')).not.toBeInTheDocument();
    expect(screen.queryByText('别高估')).not.toBeInTheDocument();
  });

  it('renders lead/detail narrative structure', async () => {
    render(<ReportPage />);

    await screen.findByText('结论');

    // 叙事段落应包含 lead（标题句）和 detail（细节）
    const bodyText = document.body.textContent ?? '';
    // lead 应包含诊断相关关键词
    expect(bodyText).toMatch(/上限|怕太累|认真在想|不想赌|不甘心|稳稳落地|选错|押错|听起来不错|收口/);
  });

  it('shows correct TL;DR for 3-direction scenario', async () => {
    render(<ReportPage />);

    await screen.findByText('结论');

    // TL;DR 应包含首选、次选、回避（用 getAllByText 避免多元素冲突）
    expect(screen.getAllByText(/计算机/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/工程/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/财经/).length).toBeGreaterThanOrEqual(1);
  });

  it('does not show avoid in TL;DR when only 2 directions', async () => {
    window.sessionStorage.clear();
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(twoDirectionPayload));
    render(<ReportPage />);

    await screen.findByText('结论');

    // TL;DR 不应含有"先别碰"
    expect(screen.queryByText('先别碰')).not.toBeInTheDocument();
  });

  it('still renders action items section', async () => {
    render(<ReportPage />);

    await screen.findByRole('heading', { name: '接下来只做两步' });

    // 至少应有两个有序步骤
    const listItems = document.querySelectorAll('ol li');
    expect(listItems.length).toBeGreaterThanOrEqual(2);
  });

  it('still renders disclaimer at bottom', async () => {
    render(<ReportPage />);

    await screen.findByText('结论');

    const disclaimer = screen.getByText(/本工具用于专业方向决策辅助/);
    expect(disclaimer).toBeInTheDocument();

    // Disclaimer 应在 footer 内
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer!.textContent).toMatch(/本工具用于专业方向决策辅助/);
  });

  it('handles empty state gracefully', () => {
    window.sessionStorage.clear();
    render(<ReportPage />);

    expect(screen.getByText('未找到问卷结果')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '返回问卷' })).toBeInTheDocument();
  });
});
