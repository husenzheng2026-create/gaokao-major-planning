// 高考专业方向决策辅助工具 - 核心类型定义
// 仅做方向组级决策辅助,不做具体专业级结论

export const directionGroupIds = [
  'cs-ai',
  'engineering-auto',
  'medical-health',
  'finance-management',
  'law-public',
  'education',
  'media-content',
  'design-art',
  'basic-research',
  'humanities-social'
] as const;

export type DirectionGroupId = (typeof directionGroupIds)[number];

export const majorChoiceArchetypes = [
  '稳中求进型',
  '成长优先型',
  '低后悔成本型',
  '现实安全型',
  '兴趣摇摆型'
] as const;

export type MajorChoiceArchetype = (typeof majorChoiceArchetypes)[number];

export interface DirectionGroup {
  id: DirectionGroupId;
  title: string;
  tags: string[];
  learningStyle: string[];
  studyPressure: '高' | '中' | '低';
  jobBreadth: '宽' | '中' | '窄';
  pathClarity: '清晰' | '中等' | '分化明显';
  advancedDegreeDependency: '高' | '中' | '低';
  industryVolatility: '高' | '中' | '低';
  cityConcentration: '高' | '中' | '低';
  platformDependency: '高' | '中' | '低';
  growthPotential: '高' | '中' | '低';
  riskNotes: string[];
  suitableFor: string[];
  cautionFor: string[];
}

// ---- Advisor Card Types (synced from web) ----

export const advisorMismatchTypes = [
  'hotness-misread',
  'long-training-mismatch',
  'stability-illusion',
  'interest-imagination-gap',
  'cost-tolerance-mismatch',
  'path-ambiguity-anxiety'
] as const;

export type AdvisorMismatchType = (typeof advisorMismatchTypes)[number];

export interface AdvisorDirectionCard {
  decisionLine: string;
  attractionLine: string;
  regretLine: string;
  mismatchLine: string;
  mismatchType: AdvisorMismatchType;
}
