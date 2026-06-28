// 高考专业方向决策辅助工具 - 叙事引擎 v6
// 精排版：每个段落 = 大标题（lead，一眼看到判断）+ 细节（detail，1-2句补充）
// 文字量相比 v5 减少约 50%，只留干货

import type { NarrativeParagraph, NarrativeParagraphId } from '@/types/assessment';
import type { ScoringContext } from '@/lib/scoring/narrative-context';

type ParagraphFn = (ctx: ScoringContext) => { lead: string; detail: string } | null;

// ---- 辅助 ----

function S(title: string): string { return title.replace(/类$/u, ''); }

function costStr(ctx: ScoringContext, idx: 0 | 1 | 2): string {
  const g = idx === 0 ? ctx.primaryGroup : idx === 1 ? ctx.secondaryGroup : ctx.avoidGroup;
  if (!g) return '长期投入';
  if (g.advancedDegreeDependency === '高') return '长培养周期';
  if (g.studyPressure === '高') return '高压训练';
  if (g.industryVolatility === '高') return '高不确定性';
  if (g.cityConcentration === '高') return '城市和平台依赖';
  return '长期训练节奏';
}

function secondaryAdvantage(ctx: ScoringContext): string {
  const p = ctx.primaryGroup;
  const s = ctx.secondaryGroup;
  if (!s) return '其他方面';
  if (p.industryVolatility === '高' && s.industryVolatility !== '高') return '稳定性';
  if (p.studyPressure === '高' && s.studyPressure !== '高') return '学习压力更小';
  if (p.advancedDegreeDependency === '高' && s.advancedDegreeDependency !== '高') return '不要求长期读研';
  if (p.cityConcentration === '高' && s.cityConcentration !== '高') return '不挑城市';
  if (p.jobBreadth === '窄' && s.jobBreadth !== '窄') return '就业面更宽';
  if (p.pathClarity === '分化明显' && s.pathClarity !== '分化明显') return '路径更清晰';
  if (s.growthPotential === '高' && p.growthPotential !== '高') return '成长空间更大';
  if (s.industryVolatility === '低') return '更稳定';
  return '其他方面';
}

// ---- 节拍 1: 开场 ----
function openingBeat(ctx: ScoringContext): { lead: string; detail: string } {
  const p = S(ctx.ranking.primary.title);
  const s = ctx.ranking.secondary ? S(ctx.ranking.secondary.title) : null;
  const a = ctx.ranking.avoidFirst ? S(ctx.ranking.avoidFirst.title) : null;
  const archetype = ctx.archetype;

  const leads: Record<string, string> = {
    '稳中求进型': `你不是保守也不是冒进——你想找一条能往上走、又不用硬赌的路。`,
    '成长优先型': `你要的是上限。但同时你也怕太累——这个矛盾本身不坏，说明你在认真想。`,
    '低后悔成本型': `你最怕的不是选不到最好的——是选错。所以我的思路是先帮你把最可能后悔的排掉。`,
    '现实安全型': `你要的是确定性。方向好不好不只看名头，更看能不能稳稳落地。`,
    '兴趣摇摆型': `你现在最需要的不是更多选择——是有人帮你收口。`
  };

  const detailParts: string[] = [];
  detailParts.push(`首选 ${p}，非妥协因子「${ctx.input.nonNegotiableFactor}」。`);
  if (s) detailParts.push(`${s} 留着做对照。`);
  if (a) detailParts.push(`${a} 先别碰。`);

  return {
    lead: leads[archetype] ?? `你的决策风格更接近「${archetype}」。`,
    detail: detailParts.join(' ')
  };
}

// ---- 节拍 2: 排序理由 ----
function whyOrderBeat(ctx: ScoringContext): { lead: string; detail: string } | null {
  const p = S(ctx.ranking.primary.title);
  const s = ctx.ranking.secondary ? S(ctx.ranking.secondary.title) : null;
  const a = ctx.ranking.avoidFirst ? S(ctx.ranking.avoidFirst.title) : null;
  const n = ctx.input.nonNegotiableFactor;

  if (!s) return null; // 只有一个方向时不需要解释排序

  const adv = secondaryAdvantage(ctx);
  const detailParts: string[] = [];

  detailParts.push(`${p} 在「${n}」上最直接。`);
  detailParts.push(`${s} 在 ${adv} 上更安全，两者互补。`);

  if (a && ctx.ranking.avoidFirst) {
    if (ctx.ranking.avoidFirst.relation === 'parent-pushed') {
      detailParts.push(`${a} 是你爸妈倾向的方向，但它跟你抗拒的点正面冲突——不是你不够努力，是路不适合你。`);
    } else {
      detailParts.push(`${a} 跟你的硬冲突最大，排在最后。`);
    }
  }

  return {
    lead: `${p} 排第一，${s} 排第二。`,
    detail: detailParts.join(' ')
  };
}

// ---- 节拍 3: 首选代价 ----
function primaryCostBeat(ctx: ScoringContext): { lead: string; detail: string } {
  const type = ctx.ranking.primary.mismatchType;
  const cost = costStr(ctx, 0);
  const risks = ctx.input.rejectedRisks.slice(0, 2).join('、');
  const caution = ctx.marketSnapshots.primary.caution;

  let detail: string;

  switch (type) {
    case 'long-training-mismatch':
      detail = `培养周期长，而你说过最不想扛的就是「${risks}」。这个矛盾不现在正视，后面会拧巴。`;
      break;
    case 'hotness-misread':
      detail = `热门≠适合你。它日常要的是高强度学习，而你抗拒「${risks}」——两件事有重叠。`;
      break;
    case 'stability-illusion':
      detail = `稳是真的，但不是白给。${cost} 绕不开。别把"听起来稳"当成"读出来也稳"。`;
      break;
    case 'interest-imagination-gap':
      detail = `好感不等于适配。它实际的学习方式跟你脑子里想的很可能不同——去验证，别靠猜。`;
      break;
    case 'cost-tolerance-mismatch':
      detail = `最吃重的是 ${cost}，而你抗拒的「${risks}」正好撞上。代价类型和你的容忍区不匹配。`;
      break;
    default:
      detail = `内部分化很大——学校、方向、城市不同，结果差好几倍。${caution ? caution : ''}`;
      break;
  }

  return {
    lead: `越往前排的方向，越要先把代价看清楚。`,
    detail
  };
}

// ---- 节拍 4: 首选 vs 次选 ----
function vsBeat(ctx: ScoringContext): { lead: string; detail: string } | null {
  if (!ctx.ranking.secondary) return null;

  const p = S(ctx.ranking.primary.title);
  const s = S(ctx.ranking.secondary.title);
  const fp = ctx.input.futurePath;
  const tc = ctx.input.trainingCycleAcceptance;

  const detailParts: string[] = [];

  if (fp === '希望空间大、成长快') {
    detailParts.push(`${p} 偏成长上限，${s} 偏稳。`);
  } else if (fp === '希望路径稳定清晰') {
    detailParts.push(`${s} 更贴你要的稳定清晰，${p} 空间大但需要自己做判断的地方也多。`);
  } else {
    detailParts.push(`${p} 的代价是 ${costStr(ctx, 0)}，${s} 的代价是 ${costStr(ctx, 1)}。`);
  }

  if (tc === '不太接受') {
    detailParts.push(`你对长期读研已经不太接受——哪个更早回报，哪个就更值得排前面。`);
  }

  detailParts.push(`别比谁好听，比谁的代价你能长期付。`);

  return {
    lead: `${p} 和 ${s} 怎么选？`,
    detail: detailParts.join(' ')
  };
}

// ---- 节拍 5: 回避方向 ----
function avoidBeat(ctx: ScoringContext): { lead: string; detail: string } | null {
  if (!ctx.ranking.avoidFirst) return null;

  const a = S(ctx.ranking.avoidFirst.title);
  const risks = ctx.input.rejectedRisks.slice(0, 2).join('、');
  const rel = ctx.ranking.avoidFirst.relation;

  let detail: string;

  if (rel === 'parent-pushed') {
    detail = `你爸妈可能觉得它好——但他们看结果，你扛过程。你最不想扛的「${risks}」正好是它的硬门槛。先划掉，把前面两个吃透再回头看。`;
  } else {
    detail = `在你现在给的条件里，它跟你的冲突是最硬的。先划掉——等前面两个吃透了再回头看也不迟。`;
  }

  return {
    lead: `${a}：现在先别碰。`,
    detail
  };
}

// ---- 节拍 6: 家庭分歧 ----
function familyBeat(ctx: ScoringContext): { lead: string; detail: string } | null {
  const fc = ctx.familyConflict;
  if (!fc.hasConflict) return null;

  const sp = fc.selfPriority;
  const pp = fc.parentPriority;

  const selfList = ctx.input.selfPreferredDirections
    .map((id) => S(ctx.rankedDirections.find((d) => d.id === id)?.title ?? ''))
    .filter(Boolean);
  const parentList = ctx.input.parentPreferredDirections
    .map((id) => S(ctx.rankedDirections.find((d) => d.id === id)?.title ?? ''))
    .filter(Boolean);

  let detail: string;

  if (fc.directionOverlapCount === 0 && selfList.length > 0 && parentList.length > 0) {
    detail = `零重叠。你挑 ${selfList.join('、')}，他们挑 ${parentList.join('、')}——你们在不同的坐标系里各说各的。今晚把你为什么看重「${sp}」的理由一个一个说清楚，也听他们为什么坚持「${pp}」。先听懂，再谈结论。`;
  } else if (fc.directionOverlapCount > 0) {
    detail = `好在方向上你们有重叠，矛盾在"为什么选"不在"选什么"。今晚把你为什么看重「${sp}」讲清楚，也认真听他们的「${pp}」。`;
  } else {
    detail = `你看重「${sp}」，他们看重「${pp}」。你看过程，他们看结果。今晚把你为什么这样选讲清楚，也认真听他们的逻辑。`;
  }

  return {
    lead: `你和爸妈的分歧：你要「${sp}」，他们要「${pp}」。`,
    detail
  };
}

// ---- 动态编排 ----

function computeBeatOrder(ctx: ScoringContext): NarrativeParagraphId[] {
  const order: NarrativeParagraphId[] = [];

  order.push('opening');

  const severeFamily =
    ctx.familyConflict.hasConflict &&
    ctx.familyConflict.directionOverlapCount === 0 &&
    ctx.input.selfPreferredDirections.length > 0 &&
    ctx.input.parentPreferredDirections.length > 0;

  if (severeFamily) {
    order.push('family');
    order.push('why-order');
  } else {
    order.push('why-order');
  }

  order.push('primary-cost');

  if (ctx.ranking.secondary) order.push('vs');
  if (ctx.ranking.avoidFirst) order.push('avoid');
  if (!severeFamily) order.push('family');

  return [...new Set(order)];
}

const BEAT_FNS: Record<NarrativeParagraphId, ParagraphFn> = {
  opening: openingBeat,
  'why-order': whyOrderBeat,
  'primary-cost': primaryCostBeat,
  vs: vsBeat,
  avoid: avoidBeat,
  family: familyBeat
};

export function buildNarrative(ctx: ScoringContext): NarrativeParagraph[] {
  const order = computeBeatOrder(ctx);

  return order
    .map((id) => {
      const fn = BEAT_FNS[id];
      if (!fn) return null;
      const result = fn(ctx);
      if (result === null) return null;
      return {
        id,
        lead: result.lead,
        detail: result.detail,
        text: result.lead + '\n' + result.detail
      };
    })
    .filter((p): p is NarrativeParagraph => p !== null);
}
