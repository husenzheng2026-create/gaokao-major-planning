import { Button, ScrollView, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import { buildReport, type Report } from '@/lib/scoring/build-report';
import { loadReportInput } from '@/lib/storage/report-storage';
import { questionnaireSchema } from '@/lib/validation/questionnaire-schema';

import './index.scss';

type PageState =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'ready'; report: Report };

const DISCLAIMER =
  '本工具用于专业方向决策辅助，不承诺录取结果、就业结果、薪资结果。最终填报请结合官方招生信息、分数位次与家庭实际情况。';

export default function ReportPage() {
  const [state, setState] = useState<PageState>({ kind: 'loading' });

  useEffect(() => {
    const raw = loadReportInput();
    const parsed = questionnaireSchema.safeParse(raw);
    if (!parsed.success) {
      setState({ kind: 'empty' });
      return;
    }
    setState({ kind: 'ready', report: buildReport(parsed.data) });
  }, []);

  if (state.kind === 'loading') {
    return (
      <View className="page-shell report-page report-page--center">
        <Text className="report-loading">正在整理你的诊断结果…</Text>
      </View>
    );
  }

  if (state.kind === 'empty') {
    return (
      <View className="page-shell report-page report-page--center">
        <View className="card report-empty">
          <Text className="report-section-title">未找到有效结果</Text>
          <Text className="report-copy">
            当前还没有可用的问卷结果，或结果已失效。请先完成诊断。
          </Text>
          <Button
            className="button-primary"
            onClick={() => Taro.navigateTo({ url: '/pages/questionnaire/index' })}
          >
            去做问卷
          </Button>
        </View>
      </View>
    );
  }

  const { report } = state;
  const primary = report.directionRanking.primary;
  const secondary = report.directionRanking.secondary;
  const avoidFirst = report.directionRanking.avoidFirst;

  return (
    <ScrollView scrollY className="report-scroll">
      <View className="page-shell report-page">
        {/* ① Hero: 类型标签 + 一句话判断 */}
        <View className="report-hero">
          <Text className="page-tag">{report.archetype}</Text>
          <Text className="report-headline">{report.expertVerdict.headline}</Text>
          <Text className="report-subheadline">{report.archetypeSummary}</Text>
        </View>

        {/* ② 为什么会这样 + 最容易后悔的点 */}
        <View className="report-grid-2col">
          <View className="card report-card--focus">
            <Text className="report-section-title">为什么会这样劝你</Text>
            <Text className="report-copy">{report.expertVerdict.whyThisOrder}</Text>
          </View>

          <View className="card report-card--warn">
            <Text className="report-section-title">你最容易后悔的点</Text>
            <Text className="report-copy">{report.expertVerdict.regretWarning}</Text>
          </View>
        </View>

        {/* ③ 方向优先级卡片 */}
        <View className="report-section">
          <Text className="report-section-label">方向优先级</Text>
        </View>

        {/* Push 卡: 现在优先押 */}
        <View className="card report-direction-card report-direction-card--push">
          <Text className="direction-badge direction-badge--push">现在优先押</Text>
          <Text className="direction-title">{primary.title}</Text>
          <Text className="direction-decision">{primary.advisorCard.decisionLine}</Text>
          <Text className="direction-detail">{primary.advisorCard.attractionLine}</Text>
          <Text className="direction-detail">{primary.advisorCard.regretLine}</Text>
          <View className="direction-mismatch">
            <Text className="direction-mismatch__text">
              {primary.advisorCard.mismatchLine}
            </Text>
          </View>
        </View>

        {/* Keep 卡: 可以留着 */}
        {secondary ? (
          <View className="card report-direction-card report-direction-card--keep">
            <Text className="direction-badge direction-badge--keep">可以留着</Text>
            <Text className="direction-title">{secondary.title}</Text>
            <Text className="direction-decision">{secondary.advisorCard.decisionLine}</Text>
            <Text className="direction-detail">{secondary.advisorCard.attractionLine}</Text>
            <Text className="direction-detail">{secondary.advisorCard.regretLine}</Text>
            <View className="direction-mismatch">
              <Text className="direction-mismatch__text">
                {secondary.advisorCard.mismatchLine}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Avoid 卡: 先别碰 */}
        {avoidFirst ? (
          <View className="card report-direction-card report-direction-card--avoid">
            <Text className="direction-badge direction-badge--avoid">先别碰</Text>
            <Text className="direction-title">{avoidFirst.title}</Text>
            <Text className="direction-decision">{avoidFirst.advisorCard.decisionLine}</Text>
            <Text className="direction-detail">{avoidFirst.advisorCard.attractionLine}</Text>
            <Text className="direction-detail">{avoidFirst.advisorCard.regretLine}</Text>
            <View className="direction-mismatch">
              <Text className="direction-mismatch__text">
                {avoidFirst.advisorCard.mismatchLine}
              </Text>
            </View>
          </View>
        ) : null}

        {/* ④ 客观现实层 */}
        <View className="report-section">
          <Text className="report-section-label">客观现实层</Text>
          <Text className="report-section-desc">
            近年公开信息里更稳定的现实信号，帮你判断值不值得继续往前排。
          </Text>
        </View>

        <View className="card report-reality-card">
          <Text className="reality-title">
            {report.marketInsights.primary.title} · 首选现实画像
          </Text>
          <Text className="report-copy">{report.marketInsights.primary.summary}</Text>

          {/* Decision Note: 最重要的——这对你意味着什么 */}
          <View className="reality-note">
            <Text className="reality-note__label">这对你意味着什么</Text>
            <Text className="reality-note__text">
              {report.marketInsights.primary.decisionNote}
            </Text>
          </View>

          {/* Data points */}
          <View className="reality-points">
            {[
              { label: '就业面', value: report.marketInsights.primary.employmentScope },
              { label: '深造依赖', value: report.marketInsights.primary.advancedStudyLoad },
              { label: '城市集中', value: report.marketInsights.primary.cityConcentration },
              { label: 'AI影响', value: report.marketInsights.primary.aiSignal },
              { label: '产业景气', value: report.marketInsights.primary.industryMomentum },
              { label: '录取信号', value: report.marketInsights.primary.admissionSignal }
            ].map(({ label, value }) => (
              <View key={label} className="reality-point">
                <Text className="reality-point__label">{label}</Text>
                <Text className="reality-point__value">{value}</Text>
              </View>
            ))}
          </View>

          <Text className="reality-caution">
            ⚠️ {report.marketInsights.primary.caution}
          </Text>
        </View>

        {report.marketInsights.secondary ? (
          <View className="card report-reality-card">
            <Text className="reality-title">
              {report.marketInsights.secondary.title} · 次选现实画像
            </Text>
            <Text className="report-copy">{report.marketInsights.secondary.summary}</Text>

            <View className="reality-note">
              <Text className="reality-note__label">这对你意味着什么</Text>
              <Text className="reality-note__text">
                {report.marketInsights.secondary.decisionNote}
              </Text>
            </View>

            <View className="reality-points">
              {[
                { label: '就业面', value: report.marketInsights.secondary.employmentScope },
                { label: '深造依赖', value: report.marketInsights.secondary.advancedStudyLoad },
                { label: '城市集中', value: report.marketInsights.secondary.cityConcentration },
                { label: 'AI影响', value: report.marketInsights.secondary.aiSignal },
                { label: '产业景气', value: report.marketInsights.secondary.industryMomentum },
                { label: '录取信号', value: report.marketInsights.secondary.admissionSignal }
              ].map(({ label, value }) => (
                <View key={label} className="reality-point">
                  <Text className="reality-point__label">{label}</Text>
                  <Text className="reality-point__value">{value}</Text>
                </View>
              ))}
            </View>

            <Text className="reality-caution">
              ⚠️ {report.marketInsights.secondary.caution}
            </Text>
          </View>
        ) : null}

        {/* 方向对比简表 */}
        <View className="card report-compare-card">
          <Text className="report-section-title">方向对比</Text>
          {report.marketInsights.comparisonRows.map((row) => (
            <View key={row.label} className="compare-row">
              <Text className="compare-row__label">{row.label}</Text>
              <View className="compare-row__values">
                <Text className="compare-row__value compare-row__value--primary">
                  {row.values[0]}
                </Text>
                {row.values[1] ? (
                  <Text className="compare-row__value">{row.values[1]}</Text>
                ) : null}
              </View>
            </View>
          ))}
          <Text className="report-source">{report.marketInsights.methodologyNote}</Text>
        </View>

        {/* ⑤ 行动建议 */}
        <View className="report-section">
          <Text className="report-section-label">
            接下来 48 小时，只做这{report.actions.length <= 2 ? '两' : '几'}刀
          </Text>
        </View>

        <View className="report-actions">
          {report.actions.map((action, index) => (
            <View key={action.title} className="card report-action-card">
              <View className="action-header">
                <Text className="action-index">0{index + 1}</Text>
                <Text className="action-title">{action.title}</Text>
              </View>
              <Text className="action-detail">{action.detail}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View className="report-footer bottom-safe-area">
          <Button
            className="button-primary"
            onClick={() => Taro.redirectTo({ url: '/pages/questionnaire/index' })}
          >
            重新做一次
          </Button>
          <Text className="report-source">{DISCLAIMER}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
