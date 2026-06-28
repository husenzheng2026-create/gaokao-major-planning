'use client';

// 高考专业方向决策辅助工具 - 报告页 v2
// 叙事流渲染：一段连续的"过来人"判断文本，不再拆成独立模块卡片

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ActionPlanList } from '@/components/report/action-plan-list';
import { NarrativeReport } from '@/components/report/narrative-report';
import { buildReport, type Report } from '@/lib/scoring/build-report';
import { loadReportInput } from '@/lib/session/report-session';
import { questionnaireSchema } from '@/lib/validation/questionnaire-schema';

type PageState =
  | { kind: 'loading' }
  | { kind: 'ready'; report: Report }
  | { kind: 'empty' };

const DISCLAIMER_TEXT =
  '本工具用于专业方向决策辅助，不承诺录取结果、就业结果、薪资结果。最终填报请结合官方招生信息、分数位次与家庭实际情况。';

function shortName(title?: string): string {
  return title?.replace(/类$/u, '') ?? '';
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
        <p className="text-sm text-slate-500">正在整理你的诊断结果…</p>
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
  const primary = report.directionRanking.primary;
  const secondary = report.directionRanking.secondary;
  const avoid = report.directionRanking.avoidFirst;

  const tldr = {
    primary: shortName(primary.title),
    secondary: secondary ? shortName(secondary.title) : null,
    avoid: avoid ? shortName(avoid.title) : null
  };

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-6 py-10 md:py-12">
      {/* 叙事流主体 */}
      <NarrativeReport paragraphs={report.narrative} tldr={tldr} />

      {/* 行动建议列表（结构化展示） */}
      <ActionPlanList title="接下来只做两步" items={report.actions} />

      {/* 合规提示 */}
      <footer className="border-t border-slate-200 pt-6 text-center">
        <p className="text-xs leading-6 text-slate-400">{DISCLAIMER_TEXT}</p>
      </footer>
    </main>
  );
}
