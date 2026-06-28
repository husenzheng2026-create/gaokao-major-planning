'use client';

// 问卷表单主体：固定核心题 + 动态题组，支持多步切换与最终提交
// 状态仅保存在组件内，提交时通过 sessionStorage 传递给报告页
// sessionStorage 读写统一由 lib/session/report-session 抽象

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { QuestionStep } from '@/components/questionnaire/question-step';
import { directionGroups } from '@/data/direction-groups';
import {
  buildQuestionnaireFlow,
  factorOptions,
  futurePathOptions,
  learningStyleOptions,
  longTermTradeoffOptions,
  riskOptions,
  trainingCycleOptions
} from '@/data/questionnaire';
import { saveReportInput } from '@/lib/session/report-session';
import { encodeReportInputToToken } from '@/lib/report/report-codec';
import { questionnaireSchema } from '@/lib/validation/questionnaire-schema';
import { directionGroupIds } from '@/types/assessment';

type QuestionnaireInput = z.infer<typeof questionnaireSchema>;
type AnswerValue = string | string[];
type AnswersState = Partial<Record<keyof QuestionnaireInput, AnswerValue>>;

const learningStyleOptionSet = new Set(learningStyleOptions);
const futurePathOptionSet = new Set(futurePathOptions);
const trainingCycleOptionSet = new Set(trainingCycleOptions);
const longTermTradeoffOptionSet = new Set(longTermTradeoffOptions);
const factorOptionSet = new Set(factorOptions);
const riskOptionSet = new Set(riskOptions);
const directionGroupIdSet = new Set(directionGroupIds);

function getCurrentValue(
  answers: AnswersState,
  id: keyof QuestionnaireInput,
  type: 'multi-select' | 'single-select'
): AnswerValue {
  const existing = answers[id];
  if (existing === undefined) {
    return type === 'multi-select' ? [] : '';
  }
  if (type === 'multi-select') {
    return Array.isArray(existing) ? existing : [];
  }
  return typeof existing === 'string' ? existing : '';
}

function isStepValid(
  question: ReturnType<typeof buildQuestionnaireFlow>[number],
  value: AnswerValue
): boolean {
  if (question.type === 'multi-select') {
    const list = Array.isArray(value) ? value : [];
    const { min = 0 } = question;
    if (list.length < min) {
      return false;
    }
    if (question.max !== undefined && list.length > question.max) {
      return false;
    }
    return true;
  }
  return typeof value === 'string' && value.length > 0;
}

interface QuestionnaireFormProps {
  seed?: number;
  mode?: 'default' | 'xhs';
  introBadge?: string;
  introTitle?: string;
  introDescription?: string;
  submitLabel?: string;
}

export function QuestionnaireForm({
  seed: seedProp,
  mode = 'default',
  introBadge,
  introTitle,
  introDescription,
  submitLabel
}: QuestionnaireFormProps = {}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [seed] = useState(() => seedProp ?? Date.now());
  const stepCardRef = useRef<HTMLElement>(null);

  const questions = useMemo(
    () =>
      buildQuestionnaireFlow({
        seed,
        answers: {
          selectedDirections: Array.isArray(answers.selectedDirections)
            ? answers.selectedDirections
            : undefined,
          selfPreferredDirections: Array.isArray(answers.selfPreferredDirections)
            ? answers.selfPreferredDirections
            : undefined,
          parentPreferredDirections: Array.isArray(answers.parentPreferredDirections)
            ? answers.parentPreferredDirections
            : undefined,
          topFactors: Array.isArray(answers.topFactors) ? answers.topFactors : undefined,
          nonNegotiableFactor:
            typeof answers.nonNegotiableFactor === 'string'
              ? answers.nonNegotiableFactor
              : undefined,
          rejectedRisks: Array.isArray(answers.rejectedRisks)
            ? answers.rejectedRisks
            : undefined
        }
      }),
    [answers, seed]
  );

  const totalSteps = questions.length;
  const currentQuestion = questions[stepIndex];
  const isLastStep = stepIndex === totalSteps - 1;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);
  const currentValue = getCurrentValue(answers, currentQuestion.id, currentQuestion.type);
  const canProceed = isStepValid(currentQuestion, currentValue);
  const shouldUseCompactGrid =
    currentQuestion.options.length >= 8 || currentQuestion.id === 'selectedDirections';
  const finalSubmitLabel = submitLabel ?? (mode === 'xhs' ? '生成正式结果' : '生成报告');

  useEffect(() => {
    if (typeof stepCardRef.current?.scrollIntoView === 'function') {
      stepCardRef.current.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
      });
    }
  }, [stepIndex]);

  const directionToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    directionGroups.forEach((group) => {
      map.set(group.title, group.id);
    });
    return map;
  }, []);

  const updateValue = (next: AnswerValue) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: next
    }));
  };

  const toggleMulti = (option: string) => {
    const list = Array.isArray(currentValue) ? currentValue : [];
    const next = list.includes(option)
      ? list.filter((item) => item !== option)
      : [...list, option];
    updateValue(next);
  };

  const setSingle = (option: string) => {
    updateValue(option);
  };

  const goPrev = () => {
    if (stepIndex === 0) return;
    setStepIndex((index) => Math.max(0, index - 1));
  };

  const goNext = () => {
    if (!canProceed) return;
    if (!isLastStep) {
      setStepIndex((index) => Math.min(totalSteps - 1, index + 1));
      return;
    }
    handleSubmit();
  };

  const normalizeForSchema = (raw: AnswersState): QuestionnaireInput => {
    const convertDirectionList = (
      value: AnswerValue | undefined
    ): QuestionnaireInput['selectedDirections'] => {
      if (Array.isArray(value)) {
        return value
          .map((item) => directionToIdMap.get(item) ?? item)
          .filter((item): item is QuestionnaireInput['selectedDirections'][number] =>
            directionGroupIdSet.has(item as QuestionnaireInput['selectedDirections'][number])
          );
      }
      if (typeof value === 'string') {
        const mapped = directionToIdMap.get(value) ?? value;
        return directionGroupIdSet.has(mapped as QuestionnaireInput['selectedDirections'][number])
          ? [mapped as QuestionnaireInput['selectedDirections'][number]]
          : [];
      }
      return [];
    };

    const convertSingle = (value: AnswerValue | undefined): string => {
      if (typeof value === 'string') {
        return directionToIdMap.get(value) ?? value;
      }
      if (Array.isArray(value) && value.length > 0) {
        const first = value[0];
        return directionToIdMap.get(first) ?? first;
      }
      return '';
    };

    const convertFactorList = (
      value: AnswerValue | undefined
    ): QuestionnaireInput['topFactors'] => {
      if (!Array.isArray(value)) {
        return [];
      }
      return value.filter((item): item is QuestionnaireInput['topFactors'][number] =>
        factorOptionSet.has(item as QuestionnaireInput['topFactors'][number])
      );
    };

    const convertRiskList = (
      value: AnswerValue | undefined
    ): QuestionnaireInput['rejectedRisks'] => {
      if (!Array.isArray(value)) {
        return [];
      }
      return value.filter((item): item is QuestionnaireInput['rejectedRisks'][number] =>
        riskOptionSet.has(item as QuestionnaireInput['rejectedRisks'][number])
      );
    };

    const convertFreeTextList = (value: AnswerValue | undefined): string[] => {
      if (!Array.isArray(value)) {
        return [];
      }
      return value.filter((item): item is string => typeof item === 'string');
    };

    const convertExactSingle = <T extends string>(
      value: AnswerValue | undefined,
      allowed: Set<T>
    ): T | '' => {
      const normalized = convertSingle(value);
      return allowed.has(normalized as T) ? (normalized as T) : '';
    };

    return {
      selectedDirections: convertDirectionList(raw.selectedDirections),
      selfPreferredDirections: convertDirectionList(raw.selfPreferredDirections),
      parentPreferredDirections: convertDirectionList(raw.parentPreferredDirections),
      topFactors: convertFactorList(raw.topFactors),
      nonNegotiableFactor: convertExactSingle(
        raw.nonNegotiableFactor,
        factorOptionSet
      ) as QuestionnaireInput['nonNegotiableFactor'],
      parentTopFactors: convertFactorList(raw.parentTopFactors),
      rejectedRisks: convertRiskList(raw.rejectedRisks),
      parentRejectedRisks: convertRiskList(raw.parentRejectedRisks),
      longTermTradeoffAcceptance: convertExactSingle(
        raw.longTermTradeoffAcceptance,
        longTermTradeoffOptionSet
      ) as QuestionnaireInput['longTermTradeoffAcceptance'],
      learningStyle: convertExactSingle(
        raw.learningStyle,
        learningStyleOptionSet
      ) as QuestionnaireInput['learningStyle'],
      futurePath: convertExactSingle(raw.futurePath, futurePathOptionSet) as QuestionnaireInput['futurePath'],
      trainingCycleAcceptance: convertExactSingle(
        raw.trainingCycleAcceptance,
        trainingCycleOptionSet
      ) as QuestionnaireInput['trainingCycleAcceptance'],
      unwantedWorkStyles: convertFreeTextList(raw.unwantedWorkStyles)
    };
  };

  const handleSubmit = () => {
    setSubmitError(null);
    const payload = normalizeForSchema(answers);
    const result = questionnaireSchema.safeParse(payload);
    if (!result.success) {
      setSubmitError('仍有题目未填写完整，请返回补全后再生成报告。');
      return;
    }

    if (mode === 'xhs') {
      const token = encodeReportInputToToken(result.data);
      router.push(`/xhs/report?answers=${encodeURIComponent(token)}`);
      return;
    }

    if (typeof window !== 'undefined' && !saveReportInput(result.data)) {
      setSubmitError('当前浏览器无法保存问卷结果，请检查隐私模式或存储权限后重试。');
      return;
    }
    router.push('/report');
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {introBadge || introTitle || introDescription ? (
        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 px-4 py-5 shadow-sm sm:px-5 md:rounded-[2rem] md:px-6 md:py-6">
          {introBadge ? (
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
              {introBadge}
            </p>
          ) : null}
          {introTitle ? (
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              {introTitle}
            </h1>
          ) : null}
          {introDescription ? (
            <p className="mt-3 text-sm leading-7 text-slate-700">{introDescription}</p>
          ) : null}
        </section>
      ) : null}

      <div>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            第 {stepIndex + 1} / {totalSteps} 题
          </span>
          <span>已完成 {progress}%</span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-slate-900 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <QuestionStep title={currentQuestion.title} stepRef={stepCardRef}>
        {currentQuestion.description ? (
          <p className="text-sm leading-6 text-slate-500">
            {currentQuestion.description}
          </p>
        ) : null}

        <div className={shouldUseCompactGrid ? 'grid gap-2.5 sm:grid-cols-2 md:gap-3' : 'space-y-2.5 md:space-y-3'}>
          {currentQuestion.options.map((option) => {
            const inputId = `${currentQuestion.id}-${option}`;
            if (currentQuestion.type === 'multi-select') {
              const list = Array.isArray(currentValue) ? currentValue : [];
              const checked = list.includes(option);
              return (
                <label
                  key={option}
                  htmlFor={inputId}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 text-slate-700 hover:border-slate-400 ${
                    shouldUseCompactGrid
                      ? 'px-3.5 py-3 text-sm leading-6 sm:px-4 sm:py-2.5 sm:text-[15px]'
                      : 'px-3.5 py-3 text-sm sm:px-4'
                  }`}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                    checked={checked}
                    onChange={() => toggleMulti(option)}
                  />
                  <span>{option}</span>
                </label>
              );
            }
            const checked = currentValue === option;
            return (
              <label
                key={option}
                htmlFor={inputId}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 text-slate-700 hover:border-slate-400 ${
                  shouldUseCompactGrid
                    ? 'px-3.5 py-3 text-sm leading-6 sm:px-4 sm:py-2.5 sm:text-[15px]'
                    : 'px-3.5 py-3 text-sm sm:px-4'
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={currentQuestion.id}
                  className="mt-1 h-4 w-4 border-slate-300"
                  checked={checked}
                  onChange={() => setSingle(option)}
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>

        {submitError ? (
          <p
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={stepIndex === 0}
            className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:py-2"
          >
            上一步
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed}
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:py-2"
          >
            {isLastStep ? finalSubmitLabel : '下一步'}
          </button>
        </div>
      </QuestionStep>
    </div>
  );
}
