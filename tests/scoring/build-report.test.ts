// 高考专业方向决策辅助工具 - 报告生成单元测试
// 覆盖 plan Task 4 Step 1 + Step 6 的两个测试用例
// 1) 常规 3 方向组输入，断言推荐数量在 3-5 之间、核心矛盾非空、首位 reasons 非空
// 2) 培养周期"不太接受"输入，断言 medical-health 不在第一位（因 advancedDegreeDependency=高 应被降权）

import { describe, expect, it } from 'vitest';
import { buildReport, type QuestionnaireInput } from '@/lib/scoring/build-report';

const baseValidPayload: QuestionnaireInput = {
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

describe('buildReport', () => {
  it('builds growth-first archetype output with strong direction ranking', () => {
    const report = buildReport(baseValidPayload);

    expect(report.archetype).toBe('成长优先型');
    expect(report.archetypeSummary.length).toBeGreaterThan(0);
    expect(report.recommendedDirections.length).toBeGreaterThanOrEqual(3);
    expect(report.recommendedDirections.length).toBeLessThanOrEqual(5);
    expect(report.summary.coreConflict.length).toBeGreaterThan(0);
    expect(report.summary.familyDifference.length).toBeGreaterThan(0);
    expect(report.summary.riskBoundary.length).toBeGreaterThan(0);
    expect(report.recommendedDirections[0].reasons.length).toBeGreaterThan(0);
    expect(
      report.recommendedDirections[0].reasons.some((reason) => /如果你|别因为|真要选|先别/u.test(reason))
    ).toBe(true);
    expect(report.directionRanking.primary.id).toBe(report.recommendedDirections[0].id);
    expect(report.directionRanking.secondary).not.toBeNull();
    expect(report.directionRanking.avoidFirst).not.toBeNull();
    expect(report.directionRanking.primary.score).toBeGreaterThanOrEqual(
      report.directionRanking.secondary!.score
    );
    expect(report.directionRanking.secondary!.score).toBeGreaterThanOrEqual(
      report.directionRanking.avoidFirst!.score
    );
    expect(report.expertVerdict.headline.length).toBeGreaterThan(0);
    expect(report.expertVerdict.regretWarning.length).toBeGreaterThan(0);
    expect(report.expertVerdict.whyThisOrder).toContain(
      report.directionRanking.primary.title.replace(/类$/u, '')
    );
    expect(report.actions).toHaveLength(2);
    expect(report.marketInsights.primary.directionId).toBe(report.directionRanking.primary.id);
    expect(report.marketInsights.primary.aiSignal.length).toBeGreaterThan(0);
    expect(report.marketInsights.primary.sources.length).toBeGreaterThan(0);
    expect(report.marketInsights.comparisonRows).toHaveLength(6);
  });

  it('demotes long-training paths when user rejects long study cycles', () => {
    const report = buildReport({
      ...baseValidPayload,
      selectedDirections: ['medical-health', 'education', 'finance-management'],
      selfPreferredDirections: ['medical-health'],
      parentPreferredDirections: ['education'],
      topFactors: ['就业稳定', '学习过程不要太痛苦', '兴趣匹配'],
      nonNegotiableFactor: '学习过程不要太痛苦',
      parentTopFactors: ['就业稳定', '社会认可度'],
      rejectedRisks: ['必须长期读研或继续深造'],
      parentRejectedRisks: ['行业波动大'],
      longTermTradeoffAcceptance: '不太接受',
      trainingCycleAcceptance: '不太接受',
      futurePath: '希望路径稳定清晰',
      learningStyle: '表达沟通与协作'
    });

    expect(report.recommendedDirections[0].id).not.toBe('medical-health');
  });

  it('classifies realistic-safe users into the safety-first archetype', () => {
    const report = buildReport({
      selectedDirections: ['education', 'finance-management', 'medical-health'],
      selfPreferredDirections: ['education'],
      parentPreferredDirections: ['education', 'medical-health'],
      topFactors: ['就业稳定', '社会认可度', '学习过程不要太痛苦'],
      nonNegotiableFactor: '就业稳定',
      parentTopFactors: ['就业稳定', '社会认可度'],
      rejectedRisks: ['行业波动大'],
      parentRejectedRisks: ['行业波动大'],
      longTermTradeoffAcceptance: '不太接受',
      learningStyle: '表达沟通与协作',
      futurePath: '希望路径稳定清晰',
      trainingCycleAcceptance: '不太接受',
      unwantedWorkStyles: ['不想高压加班']
    });

    expect(report.archetype).toBe('现实安全型');
    expect(report.directionRanking.primary.id).toBe('education');
    expect(report.directionRanking.avoidFirst).not.toBeNull();
    expect(report.directionRanking.avoidFirst?.id).not.toBe(report.directionRanking.primary.id);
    expect(report.expertVerdict.headline).toContain('稳');
  });
});
