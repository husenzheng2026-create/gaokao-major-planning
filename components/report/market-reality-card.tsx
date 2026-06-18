interface MarketRealityCardProps {
  title: string;
  summary: string;
  employmentScope: string;
  advancedStudyLoad: string;
  cityConcentration: string;
  aiSignal: string;
  industryMomentum: string;
  admissionSignal: string;
  caution: string;
  decisionNote: string;
  sourceNote: string;
}

export function MarketRealityCard(props: MarketRealityCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">{props.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{props.summary}</p>

      {/* P1: 决策翻译 —— 把数据变成"对你意味着什么" */}
      <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">对你意味着什么</p>
        <p className="mt-2 text-sm leading-7 text-sky-900">{props.decisionNote}</p>
      </div>

      <dl className="mt-4 space-y-3 text-sm text-slate-600">
        <div>
          <dt className="font-medium text-slate-900">就业面宽度</dt>
          <dd>{props.employmentScope}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">继续深造依赖</dt>
          <dd>{props.advancedStudyLoad}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">城市集中度</dt>
          <dd>{props.cityConcentration}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">AI影响</dt>
          <dd>{props.aiSignal}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">产业景气</dt>
          <dd>{props.industryMomentum}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">报考录取信号</dt>
          <dd>{props.admissionSignal}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">先别误判</dt>
          <dd>{props.caution}</dd>
        </div>
      </dl>
      <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
        {props.sourceNote}
      </p>
    </article>
  );
}
