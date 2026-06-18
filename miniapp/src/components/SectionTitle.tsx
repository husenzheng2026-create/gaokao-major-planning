import { Text } from '@tarojs/components';

interface SectionTitleProps {
  children: string;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <Text className="section-title">{children}</Text>
  );
}
