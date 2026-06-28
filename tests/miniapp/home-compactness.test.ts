import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('miniapp home compactness', () => {
  it('keeps the hero title within two lines and trust points concise', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../miniapp/src/pages/home/index.tsx'),
      'utf8'
    );

    const trustPointCount = (source.match(/text:\s*'/g) ?? []).length;
    const lineBreakCount = (source.match(/<br\s*\/>/g) ?? []).length;

    expect(trustPointCount).toBe(2);
    expect(lineBreakCount).toBeLessThanOrEqual(1);
    expect(source).toContain('开始测试');
  });
});
