import { View } from '@tarojs/components';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  /** 视觉变体：默认白底、focus 强调、warn 警告 */
  variant?: 'default' | 'focus' | 'warn';
  className?: string;
}

const variantClass: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'card-default',
  focus: 'card-focus',
  warn: 'card-warn'
};

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  return (
    <View className={`card ${variantClass[variant]} ${className}`}>
      {children}
    </View>
  );
}
