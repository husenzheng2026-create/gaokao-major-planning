interface ActionPlanItem {
  title: string;
  detail: string;
}

function shortDetail(detail: string) {
  const [sentence] = detail.split(/(?<=[。！？])/u);
  return sentence?.trim() || detail;
}

export function ActionPlanList({
  title,
  items
}: {
  title: string;
  items: ActionPlanItem[];
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {items.slice(0, 2).map((item, index) => (
          <li key={item.title} className="rounded-3xl bg-slate-50 p-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {index + 1}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{shortDetail(item.detail)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
