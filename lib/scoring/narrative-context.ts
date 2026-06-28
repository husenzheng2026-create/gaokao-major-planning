// 高考专业方向决策辅助工具 - 叙事上下文组装
// 从 QuestionnaireInput 组装 ScoringContext，供叙事引擎使用
// 评分、排序、错配识别的逻辑沿用 build-report.ts 中的函数

import type { z } from 'zod';

import { directionGroups } from '@/data/direction-groups';
import {
  directionMarketInsights,
  marketMethodologyNote
} from '@/data/market-insights';
import { detectDirectionRelation, detectMismatchType } from '@/lib/scoring/advisor-copy';
import type {
  AdvisorMismatchType,
  DirectionGroup,
  DirectionGroupId,
  DirectionRelation,
  MajorChoiceArchetype,
  MarketInsightSnapshot,
  ScoredDirection
} from '@/types/assessment';

export type QuestionnaireInput = z.infer<typeof import('@/lib/validation/questionnaire-schema').questionnaireSchema>;

// ---- ScoringContext: 叙事引擎的唯一输入 ----
// 包含所有结构化数据，每个段落函数都能看到全局

export interface ScoringContext {
  // 用户输入
  input: QuestionnaireInput;

  // 人格判定
  archetype: MajorChoiceArchetype;
  archetypeSummary: string;

  // 排序结果
  ranking: {
    primary: ScoredDirection;
    secondary: ScoredDirection | null;
    avoidFirst: ScoredDirection | null;
  };

  // 所有已评分方向
  rankedDirections: ScoredDirection[];

  // 市场数据
  marketSnapshots: {
    primary: MarketInsightSnapshot;
    secondary: MarketInsightSnapshot | null;
  };
  methodologyNote: string;

  // 完整的方向组数据（避免反复查找）
  primaryGroup: DirectionGroup;
  secondaryGroup: DirectionGroup | null;
  avoidGroup: DirectionGroup | null;

  // 家庭分歧
  familyConflict: {
    /** 自己最在意什么 */
    selfPriority: string;
    /** 家长最在意什么 */
    parentPriority: string;
    /** 是否有分歧 */
    hasConflict: boolean;
    /** 自己首选和家长首选的重合方向数 */
    directionOverlapCount: number;
  };
}

// ---- 占位函数：Step 3 在 build-report.ts 中实现 ----
// buildScoringContext 需要在评分完成后调用，因此放在 build-report.ts 内部实现
// 此文件仅定义类型和辅助函数

/** 查找方向组（带异常保护） */
export function findDirectionGroup(id: DirectionGroupId): DirectionGroup {
  const group = directionGroups.find((g) => g.id === id);
  if (!group) {
    throw new Error(`Direction group not found: ${id}`);
  }
  return group;
}

/** 组装市场数据快照 */
export function buildMarketSnapshot(
  direction: ScoredDirection,
  input: QuestionnaireInput
): MarketInsightSnapshot {
  const insight = directionMarketInsights[direction.id];

  return {
    directionId: direction.id,
    title: direction.title,
    summary: insight.summary,
    employmentScope: insight.employmentScope,
    advancedStudyLoad: insight.advancedStudyLoad,
    cityConcentration: insight.cityConcentration,
    aiSignal: insight.aiSignal,
    industryMomentum: insight.industryMomentum,
    admissionSignal: insight.admissionSignal,
    caution: insight.caution,
    decisionNote: '',
    sources: insight.sources
  };
}
