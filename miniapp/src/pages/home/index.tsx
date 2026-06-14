import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';

import './index.scss';

const disclaimer =
  '本工具用于专业方向初筛和决策辅助，不替代官方招生信息，不承诺录取、就业或薪资结果。';

const trustPoints = [
  '先帮你缩小方向范围，不直接替你拍板',
  '把兴趣偏好和现实压力放在一起判断',
  '适合已经有几个模糊方向、但不会权衡的人'
];

export default function HomePage() {
  return (
    <View className="page-shell home-page">
      <View className="home-hero">
        <Text className="page-tag">专业方向初筛工具</Text>
        <Text className="page-title">先缩小范围，再决定值不值得冲</Text>
        <Text className="page-subtitle">
          3 分钟做完这轮诊断，先看你更像哪一类，再决定后面重点研究什么。
        </Text>
      </View>

      <View className="card home-card home-card--trust">
        <Text className="home-card-title">这个工具先帮你做三件事</Text>
        {trustPoints.map((point, index) => (
          <View key={point} className="home-point">
            <Text className="home-point__index">0{index + 1}</Text>
            <Text className="home-point__text">{point}</Text>
          </View>
        ))}
      </View>

      <View className="card home-card home-card--start">
        <Text className="home-card-title">适合现在的你吗？</Text>
        <Text className="home-card-copy">
          如果你已经有 2 到 5 个模糊方向，但每个看起来都各有道理，现在就可以开始。
        </Text>
      </View>

      <View className="home-actions bottom-safe-area">
        <Button
          className="button-primary"
          onClick={() => Taro.navigateTo({ url: '/pages/questionnaire/index' })}
        >
          开始 3 分钟诊断
        </Button>
        <Button
          className="button-secondary"
          onClick={() => Taro.navigateTo({ url: '/pages/about/index' })}
        >
          查看说明
        </Button>
      </View>

      <View className="home-footer">
        <Text className="home-footer__hint">适合考生自己先做，也适合做完后拿给家长讨论。</Text>
        <Text className="home-disclaimer">{disclaimer}</Text>
      </View>
    </View>
  );
}
