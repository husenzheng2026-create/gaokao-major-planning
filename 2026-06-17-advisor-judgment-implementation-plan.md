# Advisor Judgment Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把报告中的推荐方向卡从“字段解释型”升级成“顾问判断型”，稳定输出更像升学顾问的劝进 / 保留 / 止损建议。

**Architecture:** 保留现有方向排序与市场现实引擎，只在“推荐方向卡输出层”新增一层顾问式文案生成。实现上拆成三层：先定义新结构类型，再新增 `advisor-copy.ts` 负责错配识别与模板拼装，最后由 `build-report.ts` 接入并让前端卡片改吃 `advisorCard` 字段。

**Tech Stack:** Next.js 15、React 18、TypeScript、Vitest

---

## 文件结构与职责

- Modify: `types/assessment.ts`
  - 新增顾问式方向卡结构与错配类型枚举
- Create: `lib/scoring/advisor-copy.ts`
  - 负责识别卡片角色、错配类型，并输出顾问式四句文案
- Modify: `lib/scoring/build-report.ts`
  - 给 `RecommendedDirection` 挂上 `advisorCard`，并在构建推荐方向时接入新文案层
- Modify: `components/report/recommended-direction-card.tsx`
  - 改成优先渲染 `decisionLine / attractionLine / regretLine / mismatchLine`
- Modify: `app/report/page.tsx`
  - 把 3 张方向卡的 props 改成直接传 `advisorCard`
- Modify: `tests/scoring/build-report.test.ts`
  - 补“结构存在 + 角色差异 + 文案语气”测试
- Create: `tests/scoring/advisor-copy.test.ts`
  - 独立验证错配识别与模板输出

---

### Task 1: 先用测试锁住顾问式输出结构

**Files:**
- Modify: `tests/scoring/build-report.test.ts`
- Create: `tests/scoring/advisor-copy.test.ts`
- Test: `tests/scoring/build-report.test.ts`
- Test: `tests/scoring/advisor-copy.test.ts`

- [ ] **Step 1: 在 `tests/scoring/build-report.test.ts` 追加顾问式结构断言**

```ts
it('adds advisor-style card copy for each ranked direction', () => {
  const report = buildReport(baseValidPayload);

  expect(report.directionRanking.primary.advisorCard.decisionLine.length).toBeGreaterThan(0);
  expect(report.directionRanking.primary.advisorCard.attractionLine.length).toBeGreaterThan(0);
  expect(report.directionRanking.primary.advisorCard.regretLine.length).toBeGreaterThan(0);
  expect(report.directionRanking.primary.advisorCard.mismatchLine.length).toBeGreaterThan(0);

  expect(report.directionRanking.secondary?.advisorCard.decisionLine.length).toBeGreaterThan(0);
  expect(report.directionRanking.avoidFirst?.advisorCard.decisionLine.length).toBeGreaterThan(0);
});

it('uses clearly different tones for push, keep, and avoid cards', () => {
  const report = buildReport(baseValidPayload);

  expect(report.directionRanking.primary.advisorCard.decisionLine).toMatch(/先看|先认真看|先把注意力放/u);
  expect(report.directionRanking.secondary?.advisorCard.decisionLine).toMatch(/可以留着|别太早当成答案/u);
  expect(report.directionRanking.avoidFirst?.advisorCard.decisionLine).toMatch(/先别|别把它排太前/u);
});
```

- [ ] **Step 2: 新建 `tests/scoring/advisor-copy.test.ts`，锁定错配识别**

```ts
import { describe, expect, it } from 'vitest';

import { directionGroups } from '@/data/direction-groups';
import {
  buildAdvisorCard,
  detectMismatchType,
  type DirectionCardRole
} from '@/lib/scoring/advisor-copy';
import type { QuestionnaireInput } from '@/lib/scoring/build-report';

const medical = directionGroups.find((group) => group.id === 'medical-health')!;
const csAi = directionGroups.find((group) => group.id === 'cs-ai')!;

const longCycleInput: QuestionnaireInput = {
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
};

const hotnessInput: QuestionnaireInput = {
  selectedDirections: ['cs-ai', 'engineering-auto', 'finance-management'],
  selfPreferredDirections: ['cs-ai'],
  parentPreferredDirections: ['finance-management'],
  topFactors: ['未来发展空间', '就业稳定', '兴趣匹配'],
  nonNegotiableFactor: '未来发展空间',
  parentTopFactors: ['就业稳定', '社会认可度'],
  rejectedRisks: ['课程难度高、学习压力大'],
  parentRejectedRisks: ['行业波动大'],
  longTermTradeoffAcceptance: '不太接受',
  learningStyle: '逻辑分析与解题',
  futurePath: '希望空间大、成长快',
  trainingCycleAcceptance: '有压力但可考虑',
  unwantedWorkStyles: ['不想高压加班']
};

describe('advisor-copy', () => {
  it('detects long-training mismatch for users who reject long study cycles', () => {
    expect(detectMismatchType(longCycleInput, medical)).toBe('long-training-mismatch');
  });

  it('detects hotness or cost mismatch for growth-chasing users under pressure aversion', () => {
    expect(['hotness-misread', 'cost-tolerance-mismatch']).toContain(
      detectMismatchType(hotnessInput, csAi)
    );
  });

  it('builds four-line advisor copy with role-specific tone', () => {
    const card = buildAdvisorCard('avoid' satisfies DirectionCardRole, 'long-training-mismatch', longCycleInput, medical);

    expect(card.decisionLine).toMatch(/先别|别把它排太前/u);
    expect(card.attractionLine).toContain('你会被');
    expect(card.regretLine).toMatch(/后悔/u);
    expect(card.mismatchLine).toMatch(/不是|错配|代价/u);
  });
});
```

- [ ] **Step 3: 运行测试，确认失败是因为新实现不存在**

Run:

```bash
npm test -- tests/scoring/build-report.test.ts tests/scoring/advisor-copy.test.ts
```

Expected:

1. `Cannot find module '@/lib/scoring/advisor-copy'`
2. 或 `Property 'advisorCard' does not exist`

- [ ] **Step 4: 提交红灯测试**

```bash
git add tests/scoring/build-report.test.ts tests/scoring/advisor-copy.test.ts
git commit -m "test: lock advisor judgment output"
```

---

### Task 2: 定义新类型并抽出顾问文案模板层

**Files:**
- Modify: `types/assessment.ts`
- Create: `lib/scoring/advisor-copy.ts`
- Test: `tests/scoring/advisor-copy.test.ts`

- [ ] **Step 1: 在 `types/assessment.ts` 追加错配类型与顾问卡结构**

```ts
export const advisorMismatchTypes = [
  'hotness-misread',
  'long-training-mismatch',
  'stability-illusion',
  'interest-imagination-gap',
  'cost-tolerance-mismatch',
  'path-ambiguity-anxiety'
] as const;

export type AdvisorMismatchType = (typeof advisorMismatchTypes)[number];

export interface AdvisorDirectionCard {
  decisionLine: string;
  attractionLine: string;
  regretLine: string;
  mismatchLine: string;
  mismatchType: AdvisorMismatchType;
}
```

- [ ] **Step 2: 新建 `lib/scoring/advisor-copy.ts` 的骨架**

```ts
import type { QuestionnaireInput, RecommendedDirection } from '@/lib/scoring/build-report';
import type {
  AdvisorDirectionCard,
  AdvisorMismatchType,
  DirectionGroup
} from '@/types/assessment';

export type DirectionCardRole = 'push' | 'keep' | 'avoid';

const roleDecisionTemplates: Record<DirectionCardRole, (direction: string) => string> = {
  push: (direction) => `如果你现在只能先认真看一个方向，我会建议你先看${direction}。`,
  keep: (direction) => `这个方向你可以留着，但我不建议你现在太早把${direction}当成答案。`,
  avoid: (direction) => `如果你现在只是被它的表面吸引，我会建议你先别把${direction}排太前。`
};
```

- [ ] **Step 3: 在 `advisor-copy.ts` 实现错配识别**

```ts
export function detectMismatchType(
  input: QuestionnaireInput,
  direction: DirectionGroup
): AdvisorMismatchType {
  if (
    input.rejectedRisks.includes('必须长期读研或继续深造') &&
    input.trainingCycleAcceptance === '不太接受' &&
    direction.advancedDegreeDependency === '高'
  ) {
    return 'long-training-mismatch';
  }

  if (
    input.nonNegotiableFactor === '未来发展空间' &&
    input.rejectedRisks.includes('课程难度高、学习压力大') &&
    direction.studyPressure === '高'
  ) {
    return 'hotness-misread';
  }

  if (
    input.topFactors.includes('就业稳定') &&
    direction.industryVolatility === '高'
  ) {
    return 'stability-illusion';
  }

  if (
    input.topFactors.includes('兴趣匹配') &&
    direction.pathClarity === '分化明显'
  ) {
    return 'interest-imagination-gap';
  }

  if (
    input.rejectedRisks.includes('强依赖资源、城市或人脉') &&
    (direction.cityConcentration === '高' || direction.platformDependency === '高')
  ) {
    return 'cost-tolerance-mismatch';
  }

  return 'path-ambiguity-anxiety';
}
```

- [ ] **Step 4: 在 `advisor-copy.ts` 实现四句文案生成**

```ts
function userPriority(input: QuestionnaireInput): string {
  return input.nonNegotiableFactor;
}

function directionCost(direction: DirectionGroup): string {
  if (direction.advancedDegreeDependency === '高') return '长培养周期和持续投入';
  if (direction.studyPressure === '高') return '高压训练和长期自我迭代';
  if (direction.industryVolatility === '高') return '更高的不确定性和波动';
  if (direction.cityConcentration === '高') return '对城市机会和平台环境的依赖';
  return '一段你得长期接受的训练节奏';
}

function mismatchLines(type: AdvisorMismatchType): Pick<AdvisorDirectionCard, 'regretLine' | 'mismatchLine'> {
  switch (type) {
    case 'long-training-mismatch':
      return {
        regretLine: '你以后最容易后悔的，不是这条路太难，而是它要求你投入很多年，你却并不真想为它熬那么久。',
        mismatchLine: '这个方向的问题不是值不值得读，而是它的回报节奏，和你现在能接受的投入周期不太对得上。'
      };
    case 'hotness-misread':
      return {
        regretLine: '你以后最容易后悔的，不是没赶上热门，而是把热度当成了适合度。',
        mismatchLine: '它最容易骗你的地方，是让你以为机会多就等于自己能长期待得住。'
      };
    case 'stability-illusion':
      return {
        regretLine: '你以后最容易后悔的，不是没选稳的，而是把“看起来稳”误当成了“自己读出来也会稳”。',
        mismatchLine: '真正和你不匹配的，不是这个方向的名声，而是它并没有你想象得那么省心。'
      };
    case 'interest-imagination-gap':
      return {
        regretLine: '你以后最容易后悔的，不是兴趣本身，而是你喜欢的是想象中的它，不是现实里的它。',
        mismatchLine: '真正和你不匹配的，不是这个方向的名字，而是它落到实际后的工作方式。'
      };
    case 'cost-tolerance-mismatch':
      return {
        regretLine: '你以后最容易后悔的，不是这个方向本身，而是你明明知道自己不想付这个代价，最后还是硬往前排。',
        mismatchLine: '这个方向的问题不是不好，而是它最核心的代价，正好是你现在最抗拒承担的那一类。'
      };
    case 'path-ambiguity-anxiety':
    default:
      return {
        regretLine: '你以后最容易后悔的，不是没敢冲，而是走进去以后才发现这条路比你想的更分化、更难自己判断。',
        mismatchLine: '它真正和你不对的地方，不是前景，而是路径不够直白时你会更容易反复怀疑自己。'
      };
  }
}

export function buildAdvisorCard(
  role: DirectionCardRole,
  mismatchType: AdvisorMismatchType,
  input: QuestionnaireInput,
  direction: DirectionGroup
): AdvisorDirectionCard {
  const cost = directionCost(direction);

  return {
    decisionLine: roleDecisionTemplates[role](direction.title.replace(/类$/u, '')),
    attractionLine: `你会被它吸引，不是偶然，因为你本来就很在意${userPriority(input)}。`,
    ...mismatchLines(mismatchType),
    mismatchType
  };
}
```

- [ ] **Step 5: 运行测试，确认 `advisor-copy` 独立通过**

Run:

```bash
npm test -- tests/scoring/advisor-copy.test.ts
```

Expected:

1. `3 passed`

- [ ] **Step 6: 提交类型与模板层**

```bash
git add types/assessment.ts lib/scoring/advisor-copy.ts tests/scoring/advisor-copy.test.ts
git commit -m "feat: add advisor judgment copy templates"
```

---

### Task 3: 把顾问式文案接进报告构建层

**Files:**
- Modify: `lib/scoring/build-report.ts`
- Test: `tests/scoring/build-report.test.ts`

- [ ] **Step 1: 给 `RecommendedDirection` 增加 `advisorCard` 字段**

```ts
import type { AdvisorDirectionCard } from '@/types/assessment';

export interface RecommendedDirection {
  id: DirectionGroupId;
  title: string;
  score: number;
  reasons: string[];
  tradeOffs: string[];
  fitSummary: string;
  cautionSummary: string;
  advisorCard: AdvisorDirectionCard;
}
```

- [ ] **Step 2: 在 `build-report.ts` 引入新模板层**

```ts
import {
  buildAdvisorCard,
  detectMismatchType,
  type DirectionCardRole
} from '@/lib/scoring/advisor-copy';
```

- [ ] **Step 3: 新增角色判断辅助函数**

```ts
function directionRole(index: number, total: number): DirectionCardRole {
  if (index === 0) return 'push';
  if (index === 1) return 'keep';
  if (index === total - 1) return 'avoid';
  return 'keep';
}
```

- [ ] **Step 4: 在构建推荐方向时挂上 `advisorCard`**

```ts
const allRankedDirections = directionGroups
  .filter((group) => selectedDirectionSet.has(group.id))
  .map((group, index, source) => {
    const score = scoreDirection(group, input);
    const mismatchType = detectMismatchType(input, group);
    const role = directionRole(index, source.length);

    return {
      id: group.id,
      title: group.title,
      score,
      reasons: buildReasons(group, input),
      tradeOffs: buildTradeOffs(group),
      fitSummary: buildFitSummary(group),
      cautionSummary: buildCautionSummary(group),
      advisorCard: buildAdvisorCard(role, mismatchType, input, group)
    };
  })
  .sort((a, b) => b.score - a.score);
```

Then immediately normalize the final roles after sorting:

```ts
const rankedWithAdvisorRoles = allRankedDirections.map((direction, index, source) => {
  const role = directionRole(index, source.length);
  const group = directionGroups.find((item) => item.id === direction.id)!;
  const mismatchType = detectMismatchType(input, group);

  return {
    ...direction,
    advisorCard: buildAdvisorCard(role, mismatchType, input, group)
  };
});
```

And replace downstream uses:

```ts
const directionRanking = buildDirectionRanking(rankedWithAdvisorRoles);
const recommendedDirections = rankedWithAdvisorRoles.slice(0, Math.min(TOP_N, input.selectedDirections.length));
```

- [ ] **Step 5: 强化 `tests/scoring/build-report.test.ts` 到真实语气断言**

```ts
expect(report.directionRanking.primary.advisorCard.attractionLine).toContain('你会被');
expect(report.directionRanking.primary.advisorCard.regretLine).toContain('后悔');
expect(report.directionRanking.primary.advisorCard.mismatchLine).toMatch(/不是|代价|不匹配/u);
expect(report.directionRanking.primary.advisorCard.mismatchType.length).toBeGreaterThan(0);
expect(report.directionRanking.secondary?.advisorCard.decisionLine).toMatch(/可以留着|先别太早/u);
expect(report.directionRanking.avoidFirst?.advisorCard.decisionLine).toMatch(/先别|别把它排太前/u);
```

- [ ] **Step 6: 跑评分层测试**

Run:

```bash
npm test -- tests/scoring/build-report.test.ts tests/scoring/advisor-copy.test.ts
```

Expected:

1. 两个测试文件全部通过

- [ ] **Step 7: 提交评分层接入**

```bash
git add lib/scoring/build-report.ts tests/scoring/build-report.test.ts
git commit -m "feat: generate advisor-style report judgments"
```

---

### Task 4: 改前端方向卡渲染顺序

**Files:**
- Modify: `components/report/recommended-direction-card.tsx`
- Modify: `app/report/page.tsx`
- Test: `tests/report/report-page.test.tsx`

- [ ] **Step 1: 改 `RecommendedDirectionCard` props，直接吃 `advisorCard`**

```ts
import type { AdvisorDirectionCard } from '@/types/assessment';

interface RecommendedDirectionCardProps {
  badge: string;
  title: string;
  advisorCard: AdvisorDirectionCard;
  tone?: 'primary' | 'secondary' | 'hold';
}
```

- [ ] **Step 2: 调整组件渲染顺序**

```tsx
<article className={`rounded-[1.75rem] border p-6 shadow-sm ${toneStyles}`}>
  <p className={badgeClassName}>{badge}</p>
  <h3 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h3>

  <p className="mt-4 text-base font-medium leading-7">{advisorCard.decisionLine}</p>
  <p className={`mt-3 text-sm leading-7 ${mutedText}`}>{advisorCard.attractionLine}</p>
  <p className={`mt-3 text-sm leading-7 ${mutedText}`}>{advisorCard.regretLine}</p>

  <p className={cautionClassName}>{advisorCard.mismatchLine}</p>
</article>
```

- [ ] **Step 3: 在 `app/report/page.tsx` 改调用方式**

```tsx
<RecommendedDirectionCard
  badge="现在优先押"
  title={primary.title}
  advisorCard={primary.advisorCard}
  tone="primary"
/>

<RecommendedDirectionCard
  badge="可以留着"
  title={secondary.title}
  advisorCard={secondary.advisorCard}
  tone="secondary"
/>

<RecommendedDirectionCard
  badge="先别碰"
  title={hold.title}
  advisorCard={hold.advisorCard}
  tone="hold"
/>
```

If `holdRecommendation(report)` still fabricates a fallback object, extend it with:

```ts
advisorCard: {
  decisionLine: '这个方向先别急着往前排。',
  attractionLine: '它可能会因为表面优势吸引你，但现在还不值得先扑上去。',
  regretLine: '你以后最容易后悔的，是还没搞清代价就先投入太多注意力。',
  mismatchLine: '先放一放，不是彻底否定，而是避免你过早做出高成本判断。',
  mismatchType: 'path-ambiguity-anxiety'
}
```

- [ ] **Step 4: 在 `tests/report/report-page.test.tsx` 增加新文案断言**

```ts
expect(screen.getByText(/你会被/u)).toBeInTheDocument();
expect(screen.getByText(/后悔/u)).toBeInTheDocument();
expect(screen.getByText(/先别碰|可以留着|现在优先押/u)).toBeInTheDocument();
```

- [ ] **Step 5: 跑报告页与评分层相关测试**

Run:

```bash
npm test -- tests/report/report-page.test.tsx tests/scoring/build-report.test.ts tests/scoring/advisor-copy.test.ts
```

Expected:

1. 相关测试全部通过

- [ ] **Step 6: 提交前端卡片改造**

```bash
git add components/report/recommended-direction-card.tsx app/report/page.tsx tests/report/report-page.test.tsx
git commit -m "feat: render advisor-style direction cards"
```

---

### Task 5: 全量验证与收口

**Files:**
- Verify: `tests/scoring/build-report.test.ts`
- Verify: `tests/scoring/advisor-copy.test.ts`
- Verify: `tests/report/report-page.test.tsx`
- Verify: `package.json`

- [ ] **Step 1: 跑完整测试**

Run:

```bash
npm test
```

Expected:

1. 所有测试通过

- [ ] **Step 2: 跑类型检查**

Run:

```bash
npm run typecheck
```

Expected:

1. 退出码 `0`

- [ ] **Step 3: 跑生产构建**

Run:

```bash
npm run build
```

Expected:

1. `Compiled successfully`
2. 静态页面生成完成

- [ ] **Step 4: 检查验收标准**

Checklist:

1. 推荐方向卡不再以 `reasons + cautionSummary` 为主
2. 三类卡语气明显不同
3. 每张卡都能解释吸引点、后悔点、错配点
4. 没有引入外部依赖或新数据源

- [ ] **Step 5: 最终提交**

```bash
git add types/assessment.ts lib/scoring/advisor-copy.ts lib/scoring/build-report.ts components/report/recommended-direction-card.tsx app/report/page.tsx tests/scoring/build-report.test.ts tests/scoring/advisor-copy.test.ts tests/report/report-page.test.tsx
git commit -m "feat: redesign advisor judgment cards"
```
