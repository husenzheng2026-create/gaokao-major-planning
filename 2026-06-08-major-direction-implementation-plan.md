# 高考专业方向决策辅助工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可本地运行的 MVP Web 应用，完成问卷、方向组规则分析、市场现实校验和结果报告输出闭环。

**Architecture:** 采用 Next.js App Router 单体应用，前端问卷与结果页共用一套本地方向组知识表和可解释规则引擎。首版不接外部 API，所有方向组数据与规则都保存在仓库内，优先保证稳定、可测试和可解释。

**Tech Stack:** Next.js 15、React 19、TypeScript、Tailwind CSS、Zod、Vitest、Testing Library

---

## 1. 计划前提

### 1.1 当前假设
- 当前项目目录为空仓库，尚无现成技术栈
- 首版以 Web 单页流程为主，不做账号体系
- 数据层使用本地 TypeScript 常量文件，不使用数据库
- 所有报告为即时生成，不做持久化

### 1.2 推荐文件结构

#### 创建的主要目录
- `app/`
- `components/`
- `lib/`
- `data/`
- `types/`
- `tests/`
- `public/`

#### 文件职责规划
- `app/page.tsx`：首页与开始入口
- `app/questionnaire/page.tsx`：问卷主流程页
- `app/report/page.tsx`：结果页容器
- `components/questionnaire/`：问卷题目与步骤组件
- `components/report/`：诊断卡片、市场校验卡片、方向对比表
- `data/direction-groups.ts`：方向组知识表
- `data/questionnaire.ts`：问卷题目配置
- `lib/scoring/`：规则引擎与结果生成逻辑
- `types/assessment.ts`：问卷、方向组、报告类型定义
- `tests/`：单元测试与页面渲染测试

### 1.3 实施顺序
1. 先搭最小可运行壳子
2. 先写方向组数据和类型
3. 先写规则测试，再写规则实现
4. 再做问卷页
5. 再做报告页
6. 最后补合规文案和端到端验收

## 2. 任务拆解

### Task 1: 初始化 Next.js MVP 项目骨架

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.js`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`
- Create: `.gitignore`
- Test: `tests/smoke/homepage.test.tsx`

- [ ] **Step 1: 写首页冒烟测试**

```tsx
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
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `npm test -- tests/smoke/homepage.test.tsx`
Expected: FAIL，报错 `Cannot find module '@/app/page'` 或 `Cannot find package`

- [ ] **Step 3: 初始化项目依赖与脚本**

```json
{
  "name": "major-direction-tool",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^22.10.1",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 4: 写最小 Next.js 页面壳子**

```tsx
// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16">
      <p className="text-sm font-medium text-sky-700">专业方向辅助判断</p>
      <h1 className="mt-4 text-4xl font-bold text-slate-900">
        高考专业方向决策辅助工具
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
        适合已经有几个候选方向、但不会权衡的考生和家长。完成后你会得到方向建议、
        市场现实校验和可讨论的对比报告。
      </p>
      <div className="mt-10">
        <Link
          href="/questionnaire"
          className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-white"
        >
          开始 8-12 分钟诊断
        </Link>
      </div>
      <p className="mt-8 text-sm text-slate-500">
        本工具用于辅助判断，不替代官方招生信息和最终志愿决策。
      </p>
    </main>
  );
}
```

- [ ] **Step 5: 运行测试，确认通过**

Run: `npm test -- tests/smoke/homepage.test.tsx`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "feat: scaffold nextjs mvp shell"
```

### Task 2: 定义核心类型与方向组知识表

**Files:**
- Create: `types/assessment.ts`
- Create: `data/direction-groups.ts`
- Test: `tests/data/direction-groups.test.ts`

- [ ] **Step 1: 写方向组数据测试**

```ts
import { directionGroups } from '@/data/direction-groups';

describe('directionGroups', () => {
  it('contains 10 top-level direction groups', () => {
    expect(directionGroups).toHaveLength(10);
  });

  it('includes AI and automation in visible labels', () => {
    expect(
      directionGroups.find((group) => group.id === 'cs-ai')?.tags
    ).toContain('人工智能');
    expect(
      directionGroups.find((group) => group.id === 'engineering-auto')?.tags
    ).toContain('机器人工程');
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm test -- tests/data/direction-groups.test.ts`
Expected: FAIL，报错 `Cannot find module '@/data/direction-groups'`

- [ ] **Step 3: 定义类型**

```ts
// types/assessment.ts
export type DirectionGroupId =
  | 'cs-ai'
  | 'engineering-auto'
  | 'medical-health'
  | 'finance-management'
  | 'law-public'
  | 'education'
  | 'media-content'
  | 'design-art'
  | 'basic-research'
  | 'humanities-social';

export interface DirectionGroup {
  id: DirectionGroupId;
  title: string;
  tags: string[];
  learningStyle: string[];
  studyPressure: '高' | '中' | '低';
  jobBreadth: '宽' | '中' | '窄';
  pathClarity: '清晰' | '中等' | '分化明显';
  advancedDegreeDependency: '高' | '中' | '低';
  industryVolatility: '高' | '中' | '低';
  cityConcentration: '高' | '中' | '低';
  platformDependency: '高' | '中' | '低';
  growthPotential: '高' | '中' | '低';
  riskNotes: string[];
  suitableFor: string[];
  cautionFor: string[];
}
```

- [ ] **Step 4: 写方向组知识表**

```ts
// data/direction-groups.ts
import type { DirectionGroup } from '@/types/assessment';

export const directionGroups: DirectionGroup[] = [
  {
    id: 'cs-ai',
    title: '计算机、数据与人工智能类',
    tags: ['软件工程', '数据科学', '人工智能', '网络安全'],
    learningStyle: ['逻辑分析与解题', '动手实验与实操'],
    studyPressure: '高',
    jobBreadth: '宽',
    pathClarity: '中等',
    advancedDegreeDependency: '中',
    industryVolatility: '中',
    cityConcentration: '高',
    platformDependency: '中',
    growthPotential: '高',
    riskNotes: ['热门但分化大', '需要持续学习', '城市集中明显'],
    suitableFor: ['能接受持续学习', '接受一定学习压力'],
    cautionFor: ['只因热门选择', '不愿长期更新技能']
  }
];
```

补齐剩余 9 组，字段结构保持一致。

- [ ] **Step 5: 运行测试，确认通过**

Run: `npm test -- tests/data/direction-groups.test.ts`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add types/assessment.ts data/direction-groups.ts tests/data/direction-groups.test.ts
git commit -m "feat: add direction group knowledge base"
```

### Task 3: 定义问卷配置与输入校验

**Files:**
- Create: `data/questionnaire.ts`
- Create: `lib/validation/questionnaire-schema.ts`
- Test: `tests/validation/questionnaire-schema.test.ts`

- [ ] **Step 1: 写问卷校验测试**

```ts
import { questionnaireSchema } from '@/lib/validation/questionnaire-schema';

describe('questionnaireSchema', () => {
  it('accepts a valid assessment payload', () => {
    const result = questionnaireSchema.safeParse({
      selectedDirections: ['cs-ai', 'finance-management'],
      selfPreferredDirections: ['cs-ai'],
      parentPreferredDirections: ['finance-management'],
      topFactors: ['兴趣匹配', '未来发展空间', '就业稳定'],
      nonNegotiableFactor: '未来发展空间',
      parentTopFactors: ['就业稳定', '社会认可度'],
      rejectedRisks: ['行业波动大'],
      parentRejectedRisks: ['必须长期读研或继续深造'],
      longTermTradeoffAcceptance: '看情况',
      learningStyle: '逻辑分析与解题',
      futurePath: '希望空间大、成长快',
      trainingCycleAcceptance: '有压力但可考虑',
      unwantedWorkStyles: ['不想高压加班']
    });

    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm test -- tests/validation/questionnaire-schema.test.ts`
Expected: FAIL，报错缺少 schema 文件

- [ ] **Step 3: 写问卷配置**

```ts
// data/questionnaire.ts
export const factorOptions = [
  '兴趣匹配',
  '就业稳定',
  '收入潜力',
  '社会认可度',
  '学习过程不要太痛苦',
  '未来发展空间',
  '城市机会',
  '继续深造价值'
] as const;

export const riskOptions = [
  '课程难度高、学习压力大',
  '必须长期读研或继续深造',
  '就业面比较窄',
  '工作强度高',
  '行业波动大',
  '强依赖证书或考试',
  '强依赖资源、城市或人脉'
] as const;
```

- [ ] **Step 4: 写 Zod schema**

```ts
// lib/validation/questionnaire-schema.ts
import { z } from 'zod';
import { factorOptions, riskOptions } from '@/data/questionnaire';

export const questionnaireSchema = z.object({
  selectedDirections: z.array(z.string()).min(2).max(5),
  selfPreferredDirections: z.array(z.string()),
  parentPreferredDirections: z.array(z.string()),
  topFactors: z.array(z.enum(factorOptions)).min(3).max(3),
  nonNegotiableFactor: z.enum(factorOptions),
  parentTopFactors: z.array(z.enum(factorOptions)).min(2).max(2),
  rejectedRisks: z.array(z.enum(riskOptions)).min(1),
  parentRejectedRisks: z.array(z.enum(riskOptions)).min(1),
  longTermTradeoffAcceptance: z.enum(['接受', '看情况', '不太接受']),
  learningStyle: z.enum([
    '理论阅读和记忆',
    '逻辑分析与解题',
    '动手实验与实操',
    '表达沟通与协作',
    '暂时不确定'
  ]),
  futurePath: z.enum([
    '尽快就业',
    '本科后再看',
    '接受继续深造',
    '希望路径稳定清晰',
    '希望空间大、成长快'
  ]),
  trainingCycleAcceptance: z.enum(['接受', '有压力但可考虑', '不太接受']),
  unwantedWorkStyles: z.array(z.string())
});
```

- [ ] **Step 5: 运行测试，确认通过**

Run: `npm test -- tests/validation/questionnaire-schema.test.ts`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add data/questionnaire.ts lib/validation/questionnaire-schema.ts tests/validation/questionnaire-schema.test.ts
git commit -m "feat: add questionnaire schema and options"
```

### Task 4: 先写规则引擎测试，再实现可解释评分逻辑

**Files:**
- Create: `lib/scoring/build-report.ts`
- Create: `lib/scoring/scoring-rules.ts`
- Test: `tests/scoring/build-report.test.ts`

- [ ] **Step 1: 写报告生成测试**

```ts
import { buildReport } from '@/lib/scoring/build-report';

describe('buildReport', () => {
  it('returns 3 to 5 recommended directions with reasons', () => {
    const report = buildReport({
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
    });

    expect(report.recommendedDirections.length).toBeGreaterThanOrEqual(3);
    expect(report.recommendedDirections.length).toBeLessThanOrEqual(5);
    expect(report.summary.coreConflict.length).toBeGreaterThan(0);
    expect(report.recommendedDirections[0].reasons.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm test -- tests/scoring/build-report.test.ts`
Expected: FAIL，报错缺少 `buildReport`

- [ ] **Step 3: 定义规则表**

```ts
// lib/scoring/scoring-rules.ts
export const factorWeightMap = {
  兴趣匹配: { growthPotential: 2, pathClarity: 1 },
  就业稳定: { jobBreadth: 2, industryVolatility: -2, pathClarity: 2 },
  收入潜力: { growthPotential: 2, platformDependency: 1 },
  社会认可度: { pathClarity: 1, advancedDegreeDependency: 1 },
  学习过程不要太痛苦: { studyPressure: -2 },
  未来发展空间: { growthPotential: 3 },
  城市机会: { cityConcentration: 1, jobBreadth: 1 },
  继续深造价值: { advancedDegreeDependency: 2 }
} as const;
```

- [ ] **Step 4: 写最小报告生成实现**

```ts
// lib/scoring/build-report.ts
import { directionGroups } from '@/data/direction-groups';

export function buildReport(input: any) {
  const scored = directionGroups
    .filter((group) => input.selectedDirections.includes(group.id))
    .map((group) => ({
      ...group,
      score: group.growthPotential === '高' ? 10 : 6,
      reasons: [
        `${group.title}与当前选择方向直接相关`,
        `${group.title}在你当前权重下仍值得优先比较`
      ]
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    summary: {
      decisionStyle: '当前更适合先收缩方向，再做深入比较',
      coreConflict: '你在发展空间与稳定性之间存在取舍压力',
      nextFocus: scored.map((item) => item.title).join('、')
    },
    recommendedDirections: scored
  };
}
```

- [ ] **Step 5: 运行测试，确认通过**

Run: `npm test -- tests/scoring/build-report.test.ts`
Expected: PASS

- [ ] **Step 6: 补第二个测试，覆盖风险降权逻辑**

```ts
it('demotes long-training paths when user rejects long study cycles', () => {
  const report = buildReport({
    selectedDirections: ['medical-health', 'education', 'finance-management'],
    selfPreferredDirections: ['medical-health'],
    parentPreferredDirections: ['education'],
    topFactors: ['就业稳定', '学习过程不要太痛苦', '兴趣匹配'],
    nonNegotiableFactor: '学习过程不要太痛苦',
    parentTopFactors: ['就业稳定', '社会认可度'],
    rejectedRisks: ['必须长期读研或继续深造'],
    parentRejectedRisks: ['行业波动大'],
    longTermTradeoffAcceptance: '不太接受',
    learningStyle: '表达沟通与协作',
    futurePath: '希望路径稳定清晰',
    trainingCycleAcceptance: '不太接受',
    unwantedWorkStyles: ['不想高压加班']
  });

  expect(report.recommendedDirections[0].id).not.toBe('medical-health');
});
```

- [ ] **Step 7: 按测试补全降权逻辑**

```ts
const trainingPenalty =
  input.trainingCycleAcceptance === '不太接受' &&
  group.advancedDegreeDependency === '高'
    ? -8
    : 0;
```

把 `trainingPenalty` 合并到总分。

- [ ] **Step 8: 运行整个评分测试文件**

Run: `npm test -- tests/scoring/build-report.test.ts`
Expected: PASS

- [ ] **Step 9: 提交**

```bash
git add lib/scoring/build-report.ts lib/scoring/scoring-rules.ts tests/scoring/build-report.test.ts
git commit -m "feat: add explainable scoring engine"
```

### Task 5: 实现问卷页面与本地状态管理

**Files:**
- Create: `components/questionnaire/questionnaire-form.tsx`
- Create: `components/questionnaire/question-step.tsx`
- Modify: `app/questionnaire/page.tsx`
- Test: `tests/questionnaire/questionnaire-form.test.tsx`

- [ ] **Step 1: 写问卷交互测试**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionnairePage from '@/app/questionnaire/page';

describe('QuestionnairePage', () => {
  it('shows next button only after required choices are made', async () => {
    const user = userEvent.setup();
    render(<QuestionnairePage />);

    expect(
      screen.getByRole('heading', { name: '第 1 步：候选方向' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled();

    await user.click(screen.getByLabelText('计算机、数据与人工智能类'));
    await user.click(screen.getByLabelText('财经管理类'));

    expect(screen.getByRole('button', { name: '下一步' })).toBeEnabled();
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm test -- tests/questionnaire/questionnaire-form.test.tsx`
Expected: FAIL，缺少页面与组件

- [ ] **Step 3: 实现最小问卷步骤组件**

```tsx
// components/questionnaire/question-step.tsx
interface QuestionStepProps {
  title: string;
  children: React.ReactNode;
}

export function QuestionStep({ title, children }: QuestionStepProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}
```

- [ ] **Step 4: 实现最小问卷表单**

```tsx
// app/questionnaire/page.tsx
'use client';

import { useState } from 'react';
import { QuestionStep } from '@/components/questionnaire/question-step';

const options = ['计算机、数据与人工智能类', '财经管理类', '教育与师范类'];

export default function QuestionnairePage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (value: string) => {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <QuestionStep title="第 1 步：候选方向">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
              aria-label={option}
            />
            <span>{option}</span>
          </label>
        ))}
        <button
          type="button"
          disabled={selected.length < 2}
          className="rounded-full bg-slate-900 px-5 py-3 text-white disabled:bg-slate-300"
        >
          下一步
        </button>
      </QuestionStep>
    </main>
  );
}
```

- [ ] **Step 5: 运行测试，确认通过**

Run: `npm test -- tests/questionnaire/questionnaire-form.test.tsx`
Expected: PASS

- [ ] **Step 6: 扩展到完整 12 题配置驱动流程**

```tsx
// components/questionnaire/questionnaire-form.tsx
// 使用 currentStep 索引和配置数组渲染每一道题
// 每步完成后写入本地 state，最后通过 querystring 或 sessionStorage 跳转 report
```

实现要求：
- 题目来源于 `data/questionnaire.ts`
- 页面底部显示进度
- 最后一步点击“生成报告”

- [ ] **Step 7: 补完整流程测试**

Run: `npm test -- tests/questionnaire/questionnaire-form.test.tsx`
Expected: PASS，并且测试文件至少覆盖一步切换和提交按钮出现

- [ ] **Step 8: 提交**

```bash
git add app/questionnaire/page.tsx components/questionnaire tests/questionnaire/questionnaire-form.test.tsx
git commit -m "feat: build questionnaire flow"
```

### Task 6: 实现报告页、市场现实校验和方向对比组件

**Files:**
- Create: `components/report/summary-panel.tsx`
- Create: `components/report/market-reality-card.tsx`
- Create: `components/report/direction-comparison-table.tsx`
- Modify: `app/report/page.tsx`
- Test: `tests/report/report-page.test.tsx`

- [ ] **Step 1: 写结果页测试**

```tsx
import { render, screen } from '@testing-library/react';
import ReportPage from '@/app/report/page';

describe('ReportPage', () => {
  it('renders summary, market validation and comparison sections', () => {
    render(<ReportPage />);

    expect(screen.getByRole('heading', { name: '结论摘要' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '市场现实校验' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '方向对比' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm test -- tests/report/report-page.test.tsx`
Expected: FAIL，缺少页面

- [ ] **Step 3: 写摘要组件**

```tsx
// components/report/summary-panel.tsx
interface SummaryPanelProps {
  decisionStyle: string;
  coreConflict: string;
  nextFocus: string;
}

export function SummaryPanel({
  decisionStyle,
  coreConflict,
  nextFocus
}: SummaryPanelProps) {
  return (
    <section className="rounded-3xl bg-slate-900 p-8 text-white">
      <h2 className="text-2xl font-semibold">结论摘要</h2>
      <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-200">
        <li>当前适合的决策方式：{decisionStyle}</li>
        <li>当前核心矛盾：{coreConflict}</li>
        <li>下一步重点方向：{nextFocus}</li>
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: 写市场现实校验卡片**

```tsx
// components/report/market-reality-card.tsx
interface MarketRealityCardProps {
  title: string;
  opportunity: string;
  gate: string;
  fit: string;
  misconception: string;
}

export function MarketRealityCard(props: MarketRealityCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6">
      <h3 className="text-xl font-semibold text-slate-900">{props.title}</h3>
      <dl className="mt-4 space-y-3 text-sm text-slate-600">
        <div>
          <dt className="font-medium text-slate-900">现实机会</dt>
          <dd>{props.opportunity}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">主要门槛</dt>
          <dd>{props.gate}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">适配家庭</dt>
          <dd>{props.fit}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">易误判点</dt>
          <dd>{props.misconception}</dd>
        </div>
      </dl>
    </article>
  );
}
```

- [ ] **Step 5: 写方向对比表组件**

```tsx
// components/report/direction-comparison-table.tsx
interface ComparisonRow {
  label: string;
  values: string[];
}

export function DirectionComparisonTable({
  titles,
  rows
}: {
  titles: string[];
  rows: ComparisonRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-900">维度</th>
            {titles.map((title) => (
              <th key={title} className="px-4 py-3 font-semibold text-slate-900">
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-900">{row.label}</td>
              {row.values.map((value, index) => (
                <td key={`${row.label}-${index}`} className="px-4 py-3 text-slate-600">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 6: 组装结果页**

```tsx
// app/report/page.tsx
import { SummaryPanel } from '@/components/report/summary-panel';
import { MarketRealityCard } from '@/components/report/market-reality-card';
import { DirectionComparisonTable } from '@/components/report/direction-comparison-table';

export default function ReportPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <SummaryPanel
        decisionStyle="先收缩方向，再做深入比较"
        coreConflict="你在发展空间与稳定性之间存在取舍压力"
        nextFocus="计算机、数据与人工智能类、财经管理类、教育与师范类"
      />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">市场现实校验</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <MarketRealityCard
            title="计算机、数据与人工智能类"
            opportunity="就业面较宽，但城市集中明显，分化较大。"
            gate="要求持续学习，平台和实习质量会明显影响起点。"
            fit="适合能接受一定波动、重视成长空间的家庭。"
            misconception="热门不等于轻松，基础与持续学习要求都不低。"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">方向对比</h2>
        <DirectionComparisonTable
          titles={[
            '计算机、数据与人工智能类',
            '财经管理类',
            '教育与师范类'
          ]}
          rows={[
            {
              label: '学习过程压力',
              values: ['较高，需要持续迭代', '中等，分化依赖平台', '中等，路径较稳定']
            }
          ]}
        />
      </section>
    </main>
  );
}
```

- [ ] **Step 7: 运行测试，确认通过**

Run: `npm test -- tests/report/report-page.test.tsx`
Expected: PASS

- [ ] **Step 8: 提交**

```bash
git add app/report/page.tsx components/report tests/report/report-page.test.tsx
git commit -m "feat: render report and comparison views"
```

### Task 7: 把问卷与结果真正串起来

**Files:**
- Modify: `app/questionnaire/page.tsx`
- Modify: `app/report/page.tsx`
- Create: `lib/session/report-session.ts`
- Test: `tests/integration/questionnaire-to-report.test.tsx`

- [ ] **Step 1: 写问卷到报告联通测试**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionnairePage from '@/app/questionnaire/page';

describe('questionnaire to report flow', () => {
  it('stores answers and exposes a generate report action', async () => {
    const user = userEvent.setup();
    render(<QuestionnairePage />);

    await user.click(screen.getByLabelText('计算机、数据与人工智能类'));
    await user.click(screen.getByLabelText('财经管理类'));
    await user.click(screen.getByRole('button', { name: '下一步' }));

    expect(screen.getByText('第 2 步：决策权重')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm test -- tests/integration/questionnaire-to-report.test.tsx`
Expected: FAIL，因为流程尚未支持多步切换

- [ ] **Step 3: 实现本地会话存储**

```ts
// lib/session/report-session.ts
const STORAGE_KEY = 'major-direction-report-input';

export function saveReportInput(value: unknown) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function loadReportInput() {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
```

- [ ] **Step 4: 在问卷页接入多步切换与最终提交**

实现要求：
- 使用 `currentStep` 控制步骤
- 每步完成后允许跳下一步
- 最后一步点击“生成报告”时校验 schema
- 校验通过后写入 `sessionStorage`
- 使用 `router.push('/report')`

- [ ] **Step 5: 在结果页加载输入并生成动态报告**

实现要求：
- 从 `sessionStorage` 读取问卷答案
- 调用 `buildReport`
- 若没有输入，显示返回问卷入口
- 结果页内容由真实结果驱动，不再写死

- [ ] **Step 6: 运行集成测试**

Run: `npm test -- tests/integration/questionnaire-to-report.test.tsx`
Expected: PASS

- [ ] **Step 7: 补跑问卷与报告测试**

Run: `npm test -- tests/questionnaire/questionnaire-form.test.tsx tests/report/report-page.test.tsx tests/integration/questionnaire-to-report.test.tsx`
Expected: PASS

- [ ] **Step 8: 提交**

```bash
git add app/questionnaire/page.tsx app/report/page.tsx lib/session/report-session.ts tests/integration/questionnaire-to-report.test.tsx
git commit -m "feat: connect questionnaire to report flow"
```

### Task 8: 补齐合规提示、空状态与最终验收

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/report/page.tsx`
- Create: `tests/compliance/disclaimer.test.tsx`
- Create: `README.md`

- [ ] **Step 1: 写合规文案测试**

```tsx
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';
import ReportPage from '@/app/report/page';

describe('compliance disclaimers', () => {
  it('shows decision-support disclaimer on homepage', () => {
    render(<HomePage />);
    expect(
      screen.getByText(/本工具用于辅助判断，不替代官方招生信息和最终志愿决策/)
    ).toBeInTheDocument();
  });

  it('shows non-guarantee disclaimer on report page', () => {
    render(<ReportPage />);
    expect(
      screen.getByText(/不承诺录取结果、就业结果、薪资结果/)
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npm test -- tests/compliance/disclaimer.test.tsx`
Expected: FAIL，如果结果页尚未展示完整免责声明

- [ ] **Step 3: 在首页和结果页补合规提示**

```tsx
<p className="text-sm text-slate-500">
  本工具用于专业方向辅助判断，不替代官方招生政策、院校章程与录取规则，
  也不承诺录取结果、就业结果、薪资结果。
</p>
```

- [ ] **Step 4: 写 README，明确本地运行方式**

```md
# 高考专业方向决策辅助工具

## 本地启动

```bash
npm install
npm run dev
```

## 测试

```bash
npm test
```

## 首版边界
- 仅支持方向组级分析
- 不提供院校录取概率预测
- 不接第三方 API
```

- [ ] **Step 5: 运行合规测试**

Run: `npm test -- tests/compliance/disclaimer.test.tsx`
Expected: PASS

- [ ] **Step 6: 运行全量测试**

Run: `npm test`
Expected: PASS，所有测试通过

- [ ] **Step 7: 本地手动验证**

Run: `npm run dev`
Expected:
- 打开 `/` 可见首页与 CTA
- 打开 `/questionnaire` 可完成问卷
- 提交后跳转 `/report`
- 可见结论摘要、市场现实校验、方向对比、免责声明

- [ ] **Step 8: 提交**

```bash
git add app/page.tsx app/report/page.tsx README.md tests/compliance/disclaimer.test.tsx
git commit -m "docs: finalize compliance copy and developer instructions"
```

## 3. 计划自检

### 3.1 Spec coverage
- 首页说明：Task 1、Task 8 覆盖
- 轻中度问卷：Task 3、Task 5、Task 7 覆盖
- 决策诊断：Task 4、Task 6、Task 7 覆盖
- 市场现实校验：Task 2、Task 4、Task 6 覆盖
- 重点方向建议：Task 4、Task 6、Task 7 覆盖
- 方向对比报告：Task 6 覆盖
- 合规边界：Task 8 覆盖

### 3.2 Placeholder scan
- 已避免 `TODO`、`TBD`、`写适当测试` 这类空步骤
- 每个主要编码任务都附了具体文件与最小代码片段

### 3.3 Type consistency
- 方向组 ID 使用 `DirectionGroupId`
- 问卷输入统一由 `questionnaireSchema` 约束
- 结果输出统一通过 `buildReport` 生成

