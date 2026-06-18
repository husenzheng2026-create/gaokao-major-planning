import type { AdvisorDirectionCard } from '@/types/assessment';

interface RecommendedDirectionCardProps {
  badge: string;
  title: string;
  advisorCard: AdvisorDirectionCard;
  tone?: 'primary' | 'secondary' | 'hold';
}

export function RecommendedDirectionCard({
  badge,
  title,
  advisorCard,
  tone = 'secondary'
}: RecommendedDirectionCardProps) {
  const toneStyles =
    tone === 'primary'
      ? 'border-slate-900 bg-slate-900 text-white'
      : tone === 'hold'
        ? 'border-amber-200 bg-amber-50 text-slate-900'
        : 'border-slate-200 bg-white text-slate-900';

  const mutedText =
    tone === 'primary' ? 'text-slate-200' : tone === 'hold' ? 'text-amber-900/80' : 'text-slate-600';

  const badgeClassName =
    tone === 'primary'
      ? 'text-sky-200'
      : tone === 'hold'
        ? 'text-amber-700'
        : 'text-slate-500';

  const cautionClassName =
    tone === 'primary'
      ? 'bg-white/10 text-slate-100'
      : tone === 'hold'
        ? 'bg-white/70 text-amber-900'
        : 'bg-slate-50 text-slate-700';

  return (
    <article className={`rounded-[1.75rem] border p-6 shadow-sm ${toneStyles}`}>
      <p
        className={`text-xs font-semibold uppercase tracking-[0.22em] ${badgeClassName}`}
      >
        {badge}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h3>

      <p className="mt-4 text-base font-medium leading-7">{advisorCard.decisionLine}</p>
      <p className={`mt-3 text-sm leading-7 ${mutedText}`}>{advisorCard.attractionLine}</p>
      <p className={`mt-3 text-sm leading-7 ${mutedText}`}>{advisorCard.regretLine}</p>

      <p className={`mt-5 rounded-2xl px-4 py-3 text-sm leading-6 ${cautionClassName}`}>
        {advisorCard.mismatchLine}
      </p>
    </article>
  );
}
