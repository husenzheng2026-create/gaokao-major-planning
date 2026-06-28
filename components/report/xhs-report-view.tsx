import type { Report } from '@/lib/scoring/build-report';

function stripDirectionSuffix(title: string): string {
  return title.replace(/类$/u, '');
}

export function XhsReportView({ report }: { report: Report }) {
  const primary = report.directionRanking.primary;
  const secondary = report.directionRanking.secondary;
  const avoid = report.directionRanking.avoidFirst;
  const whyParagraphs = report.narrative.slice(0, 3);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#ffffff_45%,_#f8fafc)] px-4 py-6 text-slate-900 md:px-6 md:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="overflow-hidden rounded-[1.75rem] bg-slate-950 px-5 py-6 text-white shadow-xl md:rounded-[2rem] md:px-8 md:py-7">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-300">
            已完成正式诊断
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-4xl">
            你的方向判断已经出来了
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            这份结果不是在替你拍板，而是在帮你先缩小范围，先把不该继续耗时间的方向排掉。
          </p>
        </section>

        <section className="grid gap-3 md:grid-cols-3 md:gap-4">
          <article className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:p-5 md:rounded-[1.75rem]">
            <p className="text-sm font-semibold text-emerald-700">现在优先押</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950 sm:text-2xl">
              {stripDirectionSuffix(primary.title)}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{primary.fitSummary}</p>
          </article>

          <article className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4 shadow-sm sm:p-5 md:rounded-[1.75rem]">
            <p className="text-sm font-semibold text-sky-700">可以留着</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950 sm:text-2xl">
              {secondary ? stripDirectionSuffix(secondary.title) : '先别急着扩方向'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {secondary
                ? secondary.fitSummary
                : '你当前候选方向已经不多，先把首选方向查深，再决定要不要补别的。'}
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5 md:rounded-[1.75rem]">
            <p className="text-sm font-semibold text-amber-700">先别碰</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950 sm:text-2xl">
              {avoid ? stripDirectionSuffix(avoid.title) : '没有明显禁区'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {avoid
                ? avoid.cautionSummary
                : '这次输入里没有出现必须立刻排掉的方向，但也不建议盲目继续加方向。'}
            </p>
          </article>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:rounded-[2rem] md:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">为什么会是这个判断</h2>
          <div className="mt-5 space-y-3 md:mt-6 md:space-y-4">
            {whyParagraphs.map((paragraph) => (
              <article key={paragraph.id} className="rounded-[1.5rem] bg-slate-50 p-4 sm:rounded-3xl sm:p-5">
                <p className="text-sm font-semibold leading-7 text-slate-900 sm:text-base">{paragraph.lead}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{paragraph.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:rounded-[2rem] md:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            接下来 48 小时只做这两步
          </h2>
          <ol className="mt-5 grid gap-3 md:mt-6 md:grid-cols-2 md:gap-4">
            {report.actions.slice(0, 2).map((item, index) => (
              <li key={item.title} className="rounded-[1.5rem] bg-slate-50 p-4 sm:rounded-3xl sm:p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="pb-4 text-center">
          <p className="text-xs leading-6 text-slate-400">
            本诊断用于专业方向辅助判断，不承诺录取结果、就业结果、薪资结果。最终决定请结合官方招生信息、分数位次和家庭实际情况。
          </p>
        </footer>
      </div>
    </main>
  );
}
