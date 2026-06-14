import type { MajorChoiceArchetype } from '@/types/assessment';

export const reportArchetypeCopyMap: Record<
  MajorChoiceArchetype,
  {
    hitSentence: string;
    actionTitles: [string, string];
  }
> = {
  '稳中求进型': {
    hitSentence: '你更像是在控制风险的前提下，争取一个还能持续上升的方向。',
    actionTitles: ['先比稳定底盘', '再比成长上限']
  },
  '成长优先型': {
    hitSentence: '你当前更在意长期空间，愿意为更高上限承担一定训练成本和不确定性。',
    actionTitles: ['优先核实上升通道', '给成长型方向设止损线']
  },
  '低后悔成本型': {
    hitSentence: '你当前最在意的不是一步到位，而是先保留选择空间，降低将来反悔成本。',
    actionTitles: ['先筛不可逆路径', '把试错成本说清楚']
  },
  '现实安全型': {
    hitSentence: '你会优先保住确定性、稳定性和现实可落地性，再考虑后续提升空间。',
    actionTitles: ['先确认稳定路径', '把家长期待转成清单']
  },
  '兴趣摇摆型': {
    hitSentence: '你并不是完全没兴趣，而是兴趣判断还不够稳定，容易被外部声音和短期印象带偏。',
    actionTitles: ['先做小范围排雷', '先验证真实兴趣']
  }
};
