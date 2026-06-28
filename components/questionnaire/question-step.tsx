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
      className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:rounded-3xl md:p-8"
    >
      <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h2>
      <div className="mt-5 space-y-4 md:mt-6">{children}</div>
    </section>
  );
}
