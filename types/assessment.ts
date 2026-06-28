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

// ---- 叙事引擎类型 ----

/** 一个叙事段落 */
export interface NarrativeParagraph {
  /** 段落标识 */
  id: NarrativeParagraphId;
  /** 大标题（最核心的一句判断，加粗突出） */
  lead: string;
  /** 补充说明（1-2句，较小字号） */
  detail: string;
  /** @deprecated 兼容旧版，等于 lead + '\n' + detail */
  text: string;
}

export type NarrativeParagraphId =
  | 'opening'
  | 'why-order'
  | 'primary-cost'
  | 'vs'
  | 'avoid'
  | 'family';

/** 方向关系类型 */
export type DirectionRelation = 'self-driven' | 'parent-pushed' | 'exploring';

/** 评分后的方向（不含文案，只含结构化数据） */
export interface ScoredDirection {
  id: DirectionGroupId;
  title: string;
  score: number;
  mismatchType: AdvisorMismatchType;
  relation: DirectionRelation;
  group: DirectionGroup;
}

/** 方向评分原因信号（供叙事引擎使用） */
export type ReasonSignal =
  | { kind: 'self-preferred' }
  | { kind: 'parent-preferred' }
  | { kind: 'learning-style-match'; style: string }
  | { kind: 'growth-potential-high' }
  | { kind: 'industry-stability' }
  | { kind: 'factor-align'; factor: string; field: string };

// ---- 市场数据与对比类型 ----

/** 市场数据来源 */
export interface MarketSource {
  label: string;
  url: string;
  publishedAt: string;
}

/** 方向组市场现实快照 */
export interface MarketInsightSnapshot {
  directionId: DirectionGroupId;
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
  sources: MarketSource[];
}

/** 方向对比行 */
export interface ComparisonRow {
  label: string;
  values: string[];
}
