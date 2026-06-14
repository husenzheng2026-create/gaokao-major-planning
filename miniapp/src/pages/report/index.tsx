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

const disclaimer =
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
      <View className="page-shell report-page">
        <View className="card report-card report-card--center">
          <Text className="report-copy">正在整理你的诊断结果…</Text>
        </View>
      </View>
    );
  }

  if (state.kind === 'empty') {
    return (
      <View className="page-shell report-page">
        <View className="card report-card">
          <Text className="report-title">未找到有效结果</Text>
          <Text className="report-copy">请先完成问卷，再回来看报告。</Text>
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
  const cards = [
    {
      badge: '现在优先押',
      item: report.directionRanking.primary,
      cautionLabel: '我真正担心的是'
    },
    report.directionRanking.secondary
      ? {
          badge: '可以留着',
          item: report.directionRanking.secondary,
          cautionLabel: '你往下比时重点看'
        }
      : null,
    report.directionRanking.avoidFirst
      ? {
          badge: '先别碰',
          item: report.directionRanking.avoidFirst,
          cautionLabel: '我建议先放一放'
        }
      : null
  ].filter(Boolean) as Array<{
    badge: string;
    item: NonNullable<Report['directionRanking']['primary']>;
    cautionLabel: string;
  }>;

  return (
    <ScrollView scrollY className="report-scroll">
      <View className="page-shell report-page">
        <View className="report-hero">
          <Text className="page-tag">你的判断类型</Text>
          <Text className="report-archetype">{report.archetype}</Text>
          <Text className="report-headline">{report.expertVerdict.headline}</Text>
          <Text className="report-copy">{report.archetypeSummary}</Text>
        </View>

        <View className="card report-card report-card--focus">
          <Text className="report-section-title">为什么会这样</Text>
          <Text className="report-copy">{report.expertVerdict.diagnosis}</Text>
          <Text className="report-copy report-copy--muted">{report.expertVerdict.whyThisOrder}</Text>
        </View>

        <View className="card report-card">
          <Text className="report-section-title">你现在最该先看哪边</Text>
          <Text className="report-copy">{report.summary.decisionStyle}</Text>
          <Text className="report-copy report-copy--muted">{report.summary.coreConflict}</Text>
        </View>

        <View className="card report-card report-card--warn">
          <Text className="report-section-title">你最容易后悔的点</Text>
          <Text className="report-copy">{report.expertVerdict.regretWarning}</Text>
        </View>

        {cards.map(({ badge, item, cautionLabel }) => (
          <View key={badge} className="card report-card">
            <Text className="report-badge">{badge}</Text>
            <Text className="report-card-title">{item.title}</Text>
            <Text className="report-copy">{item.fitSummary}</Text>
            {item.reasons.slice(0, 2).map((reason) => (
              <Text key={reason} className="report-bullet">
                - {reason}
              </Text>
            ))}
            <Text className="report-caution">
              {cautionLabel}：{item.cautionSummary}
            </Text>
          </View>
        ))}

        <View className="card report-card">
          <Text className="report-section-title">接下来 48 小时，只做这两刀</Text>
          {report.actions.map((action, index) => (
            <View key={action.title} className="report-action">
              <Text className="report-action-index">{index + 1}</Text>
              <View className="report-action-body">
                <Text className="report-action-title">{action.title}</Text>
                <Text className="report-copy">{action.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="card report-card">
          <Text className="report-section-title">客观现实层</Text>
          <Text className="report-copy">{report.marketInsights.primary.summary}</Text>
          {report.marketInsights.comparisonRows.map((row) => (
            <View key={row.label} className="report-row">
              <Text className="report-row-label">{row.label}</Text>
              {row.values.map((value, index) => (
                <Text key={`${row.label}-${index}`} className="report-copy">
                  {index === 0 ? '首选' : '次选'}：{value}
                </Text>
              ))}
            </View>
          ))}
          <Text className="report-source">{report.marketInsights.methodologyNote}</Text>
        </View>

        <View className="report-footer bottom-safe-area">
          <Button
            className="button-primary"
            onClick={() => Taro.redirectTo({ url: '/pages/questionnaire/index' })}
          >
            重新做一次
          </Button>
          <Text className="report-source">{disclaimer}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
