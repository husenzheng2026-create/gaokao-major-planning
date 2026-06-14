import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16">
      <p className="text-sm font-medium text-sky-700">专业方向辅助判断</p>
      <h1 className="mt-4 text-4xl font-bold text-slate-900">
        高考专业方向决策辅助工具
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
        适合已经有几个候选方向、但不会权衡的考生和家长。完成后你会得到方向建议、
        市场现实校验和可讨论的对比报告。
      </p>
      <div className="mt-10">
        <Link
          href="/questionnaire"
          className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-white"
        >
          开始 8-12 分钟诊断
        </Link>
      </div>
      <p className="mt-8 text-sm text-slate-500">
        本工具用于辅助判断，不替代官方招生信息和最终志愿决策。
      </p>
    </main>
  );
}
