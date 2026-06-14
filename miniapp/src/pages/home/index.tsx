import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.scss';

const disclaimer =
  '本工具用于专业方向初筛和决策辅助，不替代官方招生信息，不承诺录取、就业或薪资结果。';

export default function HomePage() {
  return (
    <View className="page-shell home-page">
      <View className="home-hero">
        <Text className="home-eyebrow">微信小程序版</Text>
        <Text className="home-title">高考专业方向决策</Text>
        <Text className="home-subtitle">
          先帮你缩小专业方向范围，再把主观偏好和客观现实放在一起看。
        </Text>
      </View>

      <View className="card home-card">
        <Text className="home-card-title">这个版本先做什么</Text>
        <Text className="home-card-copy">
          先完成问卷、报告、数据来源说明三块基础链路。学校、位次和省份录取层留到下一阶段。
        </Text>
      </View>

      <View className="home-actions">
        <Button
          className="button-primary"
          onClick={() => Taro.navigateTo({ url: '/pages/questionnaire/index' })}
        >
          开始诊断
        </Button>
        <Button
          className="button-secondary"
          onClick={() => Taro.navigateTo({ url: '/pages/about/index' })}
        >
          查看数据来源
        </Button>
      </View>

      <Text className="home-disclaimer">{disclaimer}</Text>
    </View>
  );
}
