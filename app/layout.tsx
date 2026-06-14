import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '高考专业方向决策辅助工具',
  description: '面向考生与家长的专业方向决策辅助工具，完成问卷即可得到方向建议、市场现实校验和方向对比报告。'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
