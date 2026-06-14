import Taro from '@tarojs/taro';

import type { QuestionnaireInput } from '@/lib/scoring/build-report';

const STORAGE_KEY = 'major-direction-report-input';

export function saveReportInput(input: QuestionnaireInput): boolean {
  try {
    Taro.setStorageSync(STORAGE_KEY, input);
    return true;
  } catch {
    return false;
  }
}

export function loadReportInput(): unknown {
  try {
    return Taro.getStorageSync(STORAGE_KEY);
  } catch {
    return null;
  }
}
