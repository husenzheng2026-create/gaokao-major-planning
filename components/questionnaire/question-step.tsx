// 问卷步骤容器组件：统一每一步的标题与内容样式
// 保持轻量展示，不承载业务逻辑

interface QuestionStepProps {
  title: string;
  children: React.ReactNode;
  stepRef?: React.RefObject<HTMLElement>;
}

export function QuestionStep({ title, children, stepRef }: QuestionStepProps) {
  return (
    <section
      ref={stepRef}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}
