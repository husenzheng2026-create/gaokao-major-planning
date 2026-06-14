interface SummaryPanelProps {
  eyebrow: string;
  title: string;
  archetype: string;
  hook: string;
  focusLabel: string;
  familyLabel: string;
  riskLabel: string;
  disclaimer: string;
}

export function SummaryPanel({
  eyebrow,
  title,
  archetype,
  hook,
  focusLabel,
  familyLabel,
  riskLabel,
  disclaimer
}: SummaryPanelProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl">
      <div className="bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.28),_transparent_34%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#111827_100%)] p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr] lg:items-end">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-sky-200">
              {eyebrow}
            </h2>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-slate-400">{archetype}</p>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">{hook}</p>
          </div>

          <dl className="grid gap-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-300">你真正在意</dt>
              <dd className="mt-2 text-base font-medium text-white">{focusLabel}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-300">家长卡点</dt>
              <dd className="mt-2 text-base font-medium text-white">{familyLabel}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-300">先别硬扛</dt>
              <dd className="mt-2 text-base font-medium text-white">{riskLabel}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-white/10 bg-slate-950/90 px-8 py-4">
        <p className="text-xs leading-6 text-slate-400">{disclaimer}</p>
      </div>
    </section>
  );
}
