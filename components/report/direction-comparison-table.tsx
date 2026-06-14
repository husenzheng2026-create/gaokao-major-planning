interface ComparisonRow {
  label: string;
  values: string[];
}

export function DirectionComparisonTable({
  titles,
  rows
}: {
  titles: string[];
  rows: ComparisonRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-900">维度</th>
            {titles.map((title) => (
              <th key={title} className="px-4 py-3 font-semibold text-slate-900">
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-900">{row.label}</td>
              {row.values.map((value, index) => (
                <td key={`${row.label}-${index}`} className="px-4 py-3 text-slate-600">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
