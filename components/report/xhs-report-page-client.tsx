'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { decodeReportInputFromToken } from '@/lib/report/report-codec';
import { buildReport } from '@/lib/scoring/build-report';

import { XhsReportView } from './xhs-report-view';

export function XhsReportPageClient() {
  const searchParams = useSearchParams();
  const answersToken = searchParams.get('answers');
  const input = answersToken ? decodeReportInputFromToken(answersToken) : null;

  if (!input) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-6">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            无法读取本次诊断结果
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            当前链接缺少完整的诊断信息，或者结果参数已损坏。你可以重新从正式入口开始，按流程重新生成一份结果。
          </p>
          <div className="mt-8">
            <Link
              href="/xhs"
              className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
            >
              重新开始正式诊断
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <XhsReportView report={buildReport(input)} />;
}
