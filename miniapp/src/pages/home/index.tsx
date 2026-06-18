import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.scss';

const DISCLAIMER =
  '本工具用于专业方向初筛和决策辅助，不替代官方招生信息，不承诺录取、就业或薪资结果。';

const TRUST_POINTS = [
  { emoji: '①', text: '先帮你缩小方向范围，不替你拍板' },
  { emoji: '②', text: '把兴趣偏好和现实压力放在一起看' },
  { emoji: '③', text: '适合已有2-5个模糊方向、但不会权衡的人' }
];

export default function HomePage() {
  return (
    <View className="page-shell home-page">
      {/* Hero */}
      <View className="home-hero">
        <Text className="page-tag">专业方向决策辅助</Text>
        <Text className="page-title">先看清楚自己，<br />再决定往哪走</Text>
        <Text className="page-subtitle">
          做完这轮诊断，你会知道自己更像哪一类考生，以及哪些方向值得继续深挖。
        </Text>
      </View>

      {/* Trust Points */}
      <View className="card home-trust">
        {TRUST_POINTS.map(({ emoji, text }) => (
          <View key={emoji} className="home-trust__row">
            <Text className="home-trust__emoji">{emoji}</Text>
            <Text className="home-trust__text">{text}</Text>
          </View>
        ))}
      </View>

      {/* Fit Check */}
      <View className="card home-fit">
        <Text className="home-fit__title">适合现在的你吗？</Text>
        <Text className="home-fit__text">
          如果你已经有几个候选方向，但每个都各有道理、很难取舍，现在就可以开始。
        </Text>
      </View>

      {/* Actions */}
      <View className="home-actions bottom-safe-area">
        <Button
          className="button-primary"
          onClick={() => Taro.navigateTo({ url: '/pages/questionnaire/index' })}
        >
          开始诊断
        </Button>
        <View
          className="button-ghost"
          onClick={() => Taro.navigateTo({ url: '/pages/about/index' })}
        >
          了解更多
        </View>
      </View>

      {/* Footer */}
      <View className="home-footer">
        <Text className="home-footer__text">适合考生自己做，也适合做完后拿给家长讨论。</Text>
        <Text className="home-disclaimer">{DISCLAIMER}</Text>
      </View>
    </View>
  );
}
