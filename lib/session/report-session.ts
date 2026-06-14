// 高考专业方向决策辅助工具 - 问卷到报告的会话存储抽象
// 单页面应用通过 sessionStorage 在问卷提交与报告页之间传递问卷结果
// 写入：问卷最后一题校验通过后调用 saveReportInput
// 读取：报告页在挂载时调用 loadReportInput，并需用 questionnaireSchema 二次校验

export const STORAGE_KEY = 'major-direction-report-input';

export function saveReportInput(value: unknown): boolean {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadReportInput(): unknown {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
