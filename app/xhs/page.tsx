import Link from 'next/link';

export default function XhsEntryPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#ffffff_42%,_#f8fafc)] px-4 py-8 text-slate-900 md:px-6 md:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-xl md:px-8 md:py-10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-300">
            小红书正式交付入口
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            高考专业方向轻诊断
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
            这是你购买后的正式诊断入口，不是公开体验版。整套流程会帮你先缩小专业方向范围，再给出一份能直接拿去讨论的判断结果。
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200">
            <span className="rounded-full border border-white/15 px-4 py-2">预计 5 到 8 分钟完成</span>
            <span className="rounded-full border border-white/15 px-4 py-2">输出裁决型方向结果</span>
            <span className="rounded-full border border-white/15 px-4 py-2">附 48 小时行动建议</span>
          </div>
          <div className="mt-8">
            <Link
              href="/xhs/questionnaire"
              className="inline-flex rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950"
            >
              开始正式诊断
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">适合现在就做的人</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <li>已经有 2 到 5 个方向，但一直不知道该先查哪个</li>
              <li>自己和家长各有想法，聊来聊去还是收不住</li>
              <li>最怕的是押错方向，而不是单纯想看一份热闹测试</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">做完你会拿到什么</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <li>一组清晰的方向裁决：现在优先押 / 可以留着 / 先别碰</li>
              <li>为什么会这么判断，不再只有空泛建议</li>
              <li>接下来 48 小时该查什么、怎么缩小范围</li>
            </ul>
          </article>
        </section>

        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-sm leading-7 text-amber-900">
            这份诊断用于帮助你更快做方向判断，不替代官方招生政策、院校章程和最终志愿填报决策，也不承诺录取、就业或薪资结果。
          </p>
        </section>
      </div>
    </main>
  );
}
