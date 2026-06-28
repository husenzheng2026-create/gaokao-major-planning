import type { NarrativeParagraph } from '@/types/assessment';

interface NarrativeReportProps {
  paragraphs: NarrativeParagraph[];
  tldr?: {
    primary: string;
    secondary: string | null;
    avoid: string | null;
  };
}

export function NarrativeReport({ paragraphs, tldr }: NarrativeReportProps) {
  return (
    <div className="mx-auto max-w-[680px] space-y-6">
      {/* TL;DR 醒目摘要卡 */}
      {tldr ? (
        <div className="rounded-2xl bg-slate-950 px-6 py-5 text-white shadow-lg">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-lg leading-8">
            <span className="text-base font-semibold text-sky-300">结论</span>
            <span>
              优先看{' '}
              <span className="font-bold text-white">{tldr.primary}</span>
            </span>
            {tldr.secondary ? (
              <span>
                · 留着{' '}
                <span className="font-semibold text-slate-300">{tldr.secondary}</span>
              </span>
            ) : null}
            {tldr.avoid ? (
              <span>
                · 先别碰{' '}
                <span className="font-semibold text-amber-400">{tldr.avoid}</span>
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* 叙事段落——每段 lead 突出、detail 收小 */}
      <div className="space-y-5">
        {paragraphs.map((p) => (
          <div key={p.id} className="border-b border-slate-100 pb-4 last:border-0">
            <p className="text-base font-bold leading-7 text-slate-900">
              {p.lead}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {p.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
