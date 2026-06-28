import { describe, expect, it } from 'vitest';

import { toggleMultiWithLimit } from '../../miniapp/src/lib/questionnaire-selection';

describe('miniapp questionnaire selection limit', () => {
  it('does not add more options after reaching the max limit', () => {
    const result = toggleMultiWithLimit({
      current: ['就业稳定', '收入潜力'],
      option: '社会认可度',
      max: 2
    });

    expect(result.next).toEqual(['就业稳定', '收入潜力']);
    expect(result.blockedByMax).toBe(true);
  });

  it('allows deselecting an already selected option even after reaching the max limit', () => {
    const result = toggleMultiWithLimit({
      current: ['就业稳定', '收入潜力'],
      option: '就业稳定',
      max: 2
    });

    expect(result.next).toEqual(['收入潜力']);
    expect(result.blockedByMax).toBe(false);
  });
});
