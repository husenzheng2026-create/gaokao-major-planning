import { QuestionnaireForm } from '@/components/questionnaire/questionnaire-form';

export default function XhsQuestionnairePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:max-w-4xl md:px-6 md:py-10">
      <QuestionnaireForm
        mode="xhs"
        seed={20260628}
        introBadge="购买后正式诊断"
        introTitle="这一轮只帮你做一件事：先把方向范围缩小。"
        introDescription="完成后会直接生成你的方向判断，不需要回到商品页重复操作。"
        submitLabel="生成正式结果"
      />
    </main>
  );
}
