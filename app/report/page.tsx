'use client';

// 高考专业方向决策辅助工具 - 报告页
// 只负责把 buildReport 的输出压缩为强结论展示，不改评分与问卷逻辑。

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ActionPlanList } from '@/components/report/action-plan-list';
import { DirectionComparisonTable } from '@/components/report/direction-comparison-table';
import { MarketRealityCard } from '@/components/report/market-reality-card';
import { RecommendedDirectionCard } from '@/components/report/recommended-direction-card';
import { SummaryPanel } from '@/components/report/summary-panel';
import { directionGroups } from '@/data/direction-groups';
import {
  buildReport,
  type RecommendedDirection,
  type Report
} from '@/lib/scoring/build-report';
import { loadReportInput } from '@/lib/session/report-session';
import { questionnaireSchema } from '@/lib/validation/questionnaire-schema';

type PageState =
  | { kind: 'loading' }
  | { kind: 'ready'; report: Report }
  | { kind: 'empty' };

const DISCLAIMER_TEXT =
  '本工具用于专业方向决策辅助，不承诺录取结果、就业结果、薪资结果。最终填报请结合官方招生信息、分数位次与家庭实际情况。';

function extractQuotedValues(text: string): string[] {
  return [...text.matchAll(/「([^」]+)」/g)].map((match) => match[1]);
}

function compactSentence(text?: string): string {
  if (!text) {
    return '先看你最在意的条件，再决定哪些方向值得继续投入。';
  }
  return text.replace(/。+$/u, '');
}

function focusLabel(report: Report): string {
  const values = extractQuotedValues(report.summary.familyDifference);
  return values[0] ?? compactSentence(report.summary.decisionStyle);
}

function familyLabel(report: Report): string {
  const values = extractQuotedValues(report.summary.familyDifference);
  return values[1] ?? '现实确定性';
}

function riskLabel(report: Report): string {
  const values = extractQuotedValues(report.summary.riskBoundary);
  return values[0] ?? compactSentence(report.summary.riskBoundary);
}

function holdRecommendation(report: Report): RecommendedDirection | undefined {
  if (report.directionRanking.avoidFirst) {
    return report.directionRanking.avoidFirst;
  }

  if (report.recommendedDirections[2]) {
    return report.recommendedDirections[2];
  }

  const recommendedIds = new Set(report.recommendedDirections.slice(0, 2).map((item) => item.id));
  const fallbackGroup = directionGroups.find((group) => !recommendedIds.has(group.id));

  if (!fallbackGroup) {
    return undefined;
  }

  return {
    id: fallbackGroup.id,
    title: fallbackGroup.title,
    score: 0,
    reasons: fallbackGroup.riskNotes.slice(0, 2),
    tradeOffs: fallbackGroup.riskNotes.slice(0, 2),
    fitSummary: fallbackGroup.suitableFor[0] ?? '当前信息下不建议优先投入太多比较成本。',
    cautionSummary:
      fallbackGroup.cautionFor[0] ??
      fallbackGroup.riskNotes[0] ??
      '需要先核实代价，再决定是否继续往前排。'
  };
}

function buildSourceNote(report: Report, tier: 'primary' | 'secondary'): string {
  const insight =
    tier === 'primary' ? report.marketInsights.primary : report.marketInsights.secondary;

  if (!insight) {
    return report.marketInsights.methodologyNote;
  }

  const sourceNames = insight.sources.map((source) => source.label).join('、');
  return `${report.marketInsights.methodologyNote} 当前卡片参考：${sourceNames}。`;
}

export default function ReportPage() {
  const [state, setState] = useState<PageState>({ kind: 'loading' });

  useEffect(() => {
    const raw = loadReportInput();
    const parsed = questionnaireSchema.safeParse(raw);

    if (!parsed.success) {
      setState({ kind: 'empty' });
      return;
    }

    setState({
      kind: 'ready',
      report: buildReport(parsed.data)
    });
  }, []);

  if (state.kind === 'loading') {
    return (
      <main className="mx-auto max-w-4xl space-y-4 px-6 py-16">
        <p className="text-sm text-slate-500">{DISCLAIMER_TEXT}</p>
        <p className="text-sm text-slate-500">正在加载报告…</p>
      </main>
    );
  }

  if (state.kind === 'empty') {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        <p className="text-sm text-slate-500">{DISCLAIMER_TEXT}</p>
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">未找到问卷结果</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            当前还没有可用的问卷输入，或问卷结果已失效。请回到问卷页完成 8-12 分钟的诊断，
            我们会基于你的输入生成方向建议与对比报告。
          </p>
          <div className="mt-6">
            <Link
              href="/questionnaire"
              className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm text-white"
            >
              返回问卷
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const { report } = state;
  const primary = report.directionRanking.primary ?? report.recommendedDirections[0];
  const secondary = report.directionRanking.secondary ?? report.recommendedDirections[1];
  const hold = holdRecommendation(report);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10 md:space-y-8 md:py-12">
      <SummaryPanel
        eyebrow="一句话判断"
        title={report.expertVerdict.headline}
        archetype={report.archetype}
        hook={report.expertVerdict.diagnosis}
        focusLabel={focusLabel(report)}
        familyLabel={familyLabel(report)}
        riskLabel={riskLabel(report)}
        disclaimer={DISCLAIMER_TEXT}
      />

      <section className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            为什么我会这样劝你
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-700">{report.expertVerdict.whyThisOrder}</p>
        </article>

        <article className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            你最容易后悔的点
          </h2>
          <p className="mt-4 text-sm leading-8 text-rose-900">{report.expertVerdict.regretWarning}</p>
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="sr-only">方向优先级</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {primary ? (
            <RecommendedDirectionCard
              badge="现在优先押"
              title={primary.title}
              summary={`这不是最安全的说法，但我会建议你先把它排第一。${compactSentence(primary.fitSummary)}。`}
              reasons={primary.reasons}
              caution={`我真正担心的是：${compactSentence(primary.cautionSummary)}。`}
              tone="primary"
            />
          ) : null}

          {secondary ? (
            <RecommendedDirectionCard
              badge="可以留着"
              title={secondary.title}
              summary={`可以保留，但先别让它抢走第一顺位。${compactSentence(secondary.fitSummary)}。`}
              reasons={secondary.reasons}
              caution={`你再往下比时，重点看这件事：${compactSentence(secondary.cautionSummary)}。`}
              tone="secondary"
            />
          ) : null}

          {hold ? (
            <RecommendedDirectionCard
              badge="先别碰"
              title={hold.title}
              summary={`不是永远不能选，但你现在真没必要先扑上去。${compactSentence(hold.fitSummary)}。`}
              reasons={hold.tradeOffs.length > 0 ? hold.tradeOffs : hold.reasons}
              caution={`我建议先放一放，主要是因为：${compactSentence(hold.cautionSummary)}。`}
              tone="hold"
            />
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">客观现实层</h2>
          <p className="text-sm leading-7 text-slate-600">
            这部分不再只看你的主观偏好，而是把近年公开信息里更稳定的现实信号摆出来，帮助你判断“值不值得继续往前排”。
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <MarketRealityCard
            title={`${report.marketInsights.primary.title} · 首选现实画像`}
            summary={report.marketInsights.primary.summary}
            employmentScope={report.marketInsights.primary.employmentScope}
            advancedStudyLoad={report.marketInsights.primary.advancedStudyLoad}
            cityConcentration={report.marketInsights.primary.cityConcentration}
            aiSignal={report.marketInsights.primary.aiSignal}
            industryMomentum={report.marketInsights.primary.industryMomentum}
            admissionSignal={report.marketInsights.primary.admissionSignal}
            caution={report.marketInsights.primary.caution}
            sourceNote={buildSourceNote(report, 'primary')}
          />

          {report.marketInsights.secondary ? (
            <MarketRealityCard
              title={`${report.marketInsights.secondary.title} · 次选现实画像`}
              summary={report.marketInsights.secondary.summary}
              employmentScope={report.marketInsights.secondary.employmentScope}
              advancedStudyLoad={report.marketInsights.secondary.advancedStudyLoad}
              cityConcentration={report.marketInsights.secondary.cityConcentration}
              aiSignal={report.marketInsights.secondary.aiSignal}
              industryMomentum={report.marketInsights.secondary.industryMomentum}
              admissionSignal={report.marketInsights.secondary.admissionSignal}
              caution={report.marketInsights.secondary.caution}
              sourceNote={buildSourceNote(report, 'secondary')}
            />
          ) : null}
        </div>

        <DirectionComparisonTable
          titles={[
            report.marketInsights.primary.title,
            report.marketInsights.secondary?.title ?? '暂无次选方向'
          ]}
          rows={report.marketInsights.comparisonRows}
        />
        <p className="text-xs leading-6 text-slate-500">{report.marketInsights.methodologyNote}</p>
      </section>

      <ActionPlanList title="接下来 48 小时，只做这两刀" items={report.actions} />
    </main>
  );
}
