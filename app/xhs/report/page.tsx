import { Suspense } from 'react';

import { XhsReportPageClient } from '@/components/report/xhs-report-page-client';

function ReportLoadingFallback() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-6">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm leading-7 text-slate-600">正在读取本次诊断结果，请稍等。</p>
      </div>
    </main>
  );
}

export default function XhsReportPage() {
  return (
    <Suspense fallback={<ReportLoadingFallback />}>
      <XhsReportPageClient />
    </Suspense>
  );
}
