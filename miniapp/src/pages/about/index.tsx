import { Text, View } from '@tarojs/components';

import './index.scss';

const sources = [
  '教育部本科专业目录与备案审批结果',
  '阳光高考专业知识库与选科参考',
  '国家统计局统计公报',
  '国家大学生就业服务平台'
];

export default function AboutPage() {
  return (
    <View className="page-shell about-page">
      <View className="card">
        <Text className="about-title">当前数据边界</Text>
        <Text className="about-copy">
          当前版本展示的是方向级现实信号，不等同于具体学校、具体专业、具体省份的录取建议。
        </Text>
      </View>

      <View className="card about-list">
        <Text className="about-title">主要来源</Text>
        {sources.map((item) => (
          <Text key={item} className="about-item">
            - {item}
          </Text>
        ))}
      </View>
    </View>
  );
}
