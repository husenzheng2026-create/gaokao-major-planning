import { Button, ScrollView, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';

import {
  buildQuestionnaireFlow,
  factorOptions,
  futurePathOptions,
  learningStyleOptions,
  longTermTradeoffOptions,
  riskOptions,
  trainingCycleOptions
} from '@/data/questionnaire';
import { directionGroups } from '@/data/direction-groups';
import { saveReportInput } from '@/lib/storage/report-storage';
import { questionnaireSchema } from '@/lib/validation/questionnaire-schema';
import { directionGroupIds } from '@/types/assessment';

import './index.scss';

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
  return type === 'multi-select'
    ? Array.isArray(existing) ? existing : []
    : typeof existing === 'string' ? existing : '';
}

function isStepValid(
  question: ReturnType<typeof buildQuestionnaireFlow>[number],
  value: AnswerValue
): boolean {
  if (question.type === 'multi-select') {
    const list = Array.isArray(value) ? value : [];
    const { min = 0 } = question;
    if (list.length < min) return false;
    if (question.max !== undefined && list.length > question.max) return false;
    return true;
  }
  return typeof value === 'string' && value.length > 0;
}

export default function QuestionnairePage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [submitError, setSubmitError] = useState('');
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [seed] = useState(() => Date.now());
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const currentQuestion = questions[stepIndex];
  const currentValue = getCurrentValue(answers, currentQuestion.id, currentQuestion.type);
  const progress = Math.round(((stepIndex + 1) / questions.length) * 100);
  const canProceed = isStepValid(currentQuestion, currentValue);
  const isLastStep = stepIndex === questions.length - 1;
  const isMultiSelect = currentQuestion.type === 'multi-select';

  const directionToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    directionGroups.forEach((group) => map.set(group.title, group.id));
    return map;
  }, []);

  const updateValue = (next: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: next }));
  };

  const goNext = () => {
    setStepIndex((index) => Math.min(questions.length - 1, index + 1));
    setSubmitError('');
  };

  const goPrev = () => {
    setStepIndex((index) => Math.max(0, index - 1));
    setSubmitError('');
  };

  const toggleMulti = (option: string) => {
    const list = Array.isArray(currentValue) ? currentValue : [];
    const next = list.includes(option)
      ? list.filter((item) => item !== option)
      : [...list, option];
    updateValue(next);
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
      return [];
    };

    const convertSingle = (value: AnswerValue | undefined): string => {
      if (typeof value === 'string') return directionToIdMap.get(value) ?? value;
      if (Array.isArray(value) && value.length > 0)
        return directionToIdMap.get(value[0]) ?? value[0];
      return '';
    };

    const convertFactorList = (
      value: AnswerValue | undefined
    ): QuestionnaireInput['topFactors'] =>
      Array.isArray(value)
        ? value.filter((item): item is QuestionnaireInput['topFactors'][number] =>
            factorOptionSet.has(item as QuestionnaireInput['topFactors'][number])
          )
        : [];

    const convertRiskList = (
      value: AnswerValue | undefined
    ): QuestionnaireInput['rejectedRisks'] =>
      Array.isArray(value)
        ? value.filter((item): item is QuestionnaireInput['rejectedRisks'][number] =>
            riskOptionSet.has(item as QuestionnaireInput['rejectedRisks'][number])
          )
        : [];

    const convertFreeTextList = (value: AnswerValue | undefined): string[] =>
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string')
        : [];

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
      futurePath: convertExactSingle(
        raw.futurePath,
        futurePathOptionSet
      ) as QuestionnaireInput['futurePath'],
      trainingCycleAcceptance: convertExactSingle(
        raw.trainingCycleAcceptance,
        trainingCycleOptionSet
      ) as QuestionnaireInput['trainingCycleAcceptance'],
      unwantedWorkStyles: convertFreeTextList(raw.unwantedWorkStyles)
    };
  };

  const handleSubmit = (nextAnswers?: AnswersState) => {
    setSubmitError('');
    const payload = normalizeForSchema(nextAnswers ?? answers);
    const result = questionnaireSchema.safeParse(payload);
    if (!result.success) {
      setSubmitError('仍有题目未填写完整，请继续补全。');
      return;
    }
    if (!saveReportInput(result.data)) {
      setSubmitError('当前设备无法保存问卷结果，请稍后重试。');
      return;
    }
    Taro.navigateTo({ url: '/pages/report/index' });
  };

  const handleSingleSelect = (option: string) => {
    if (isAdvancing) return;

    const nextAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(nextAnswers);
    setIsAdvancing(true);
    setSubmitError('');

    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);

    advanceTimerRef.current = setTimeout(() => {
      setIsAdvancing(false);
      if (isLastStep) {
        handleSubmit(nextAnswers);
      } else {
        goNext();
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const selectedCount = Array.isArray(currentValue) ? currentValue.length : 0;

  return (
    <ScrollView scrollY className="questionnaire-scroll">
      {/* Compact Progress Bar */}
      <View className="questionnaire-progress-bar">
        <View
          className="questionnaire-progress-bar__fill"
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="page-shell questionnaire-page">
        {/* Step Indicator */}
        <View className="questionnaire-step">
          <Text className="questionnaire-step__count">
            {stepIndex + 1}/{questions.length}
          </Text>
          {isMultiSelect && currentQuestion.min ? (
            <Text className="questionnaire-step__hint">
              {selectedCount >= currentQuestion.min
                ? `已选 ${selectedCount} 项 ✓`
                : `至少选 ${currentQuestion.min} 项`}
            </Text>
          ) : null}
          {!isMultiSelect ? (
            <Text className="questionnaire-step__hint">点击选项自动进入下一题</Text>
          ) : null}
        </View>

        {/* Question Card */}
        <View className="card questionnaire-card">
          <Text className="questionnaire-title">{currentQuestion.title}</Text>
          {currentQuestion.description ? (
            <Text className="questionnaire-description">
              {currentQuestion.description}
            </Text>
          ) : null}

          {/* Options */}
          <View className="questionnaire-options">
            {currentQuestion.options.map((option) => {
              const selected =
                currentQuestion.type === 'multi-select'
                  ? Array.isArray(currentValue) && currentValue.includes(option)
                  : currentValue === option;

              return (
                <View
                  key={option}
                  className={`questionnaire-option${selected ? ' is-selected' : ''}`}
                  onClick={() =>
                    currentQuestion.type === 'multi-select'
                      ? toggleMulti(option)
                      : handleSingleSelect(option)
                  }
                >
                  <Text className="questionnaire-option__label">{option}</Text>
                  {selected ? (
                    <View className="questionnaire-option__check">✓</View>
                  ) : (
                    <View className="questionnaire-option__circle" />
                  )}
                </View>
              );
            })}
          </View>

          {submitError ? (
            <Text className="questionnaire-error">{submitError}</Text>
          ) : null}
        </View>

        {/* Bottom Actions */}
        <View className="questionnaire-actions bottom-safe-area">
          <View className="questionnaire-actions__row">
            <Button
              className="button-ghost"
              disabled={stepIndex === 0}
              onClick={goPrev}
            >
              上一题
            </Button>

            {isMultiSelect ? (
              <Button
                className="button-primary questionnaire-actions__continue"
                disabled={!canProceed}
                onClick={() => (isLastStep ? handleSubmit() : goNext())}
              >
                {isLastStep ? '生成报告' : '继续'}
              </Button>
            ) : null}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
