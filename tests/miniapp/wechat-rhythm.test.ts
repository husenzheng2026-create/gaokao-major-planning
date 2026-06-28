import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return fs.readFileSync(path.resolve(__dirname, '../../', relativePath), 'utf8');
}

describe('miniapp wechat rhythm', () => {
  it('keeps the home page in a compact single-screen rhythm', () => {
    const homeSource = readSource('miniapp/src/pages/home/index.tsx');
    const appStyle = readSource('miniapp/src/app.scss');

    expect(homeSource).not.toContain('className="card home-trust"');
    expect(homeSource).toContain('开始测试');
    expect(appStyle).toMatch(/\.page-title\s*\{[\s\S]*font-size:\s*36px;/);
    expect(appStyle).toMatch(/\.button-primary\s*\{[\s\S]*font-size:\s*22px;/);
  });

  it('keeps questionnaire typography and spacing within miniapp scale', () => {
    const questionnaireSource = readSource('miniapp/src/pages/questionnaire/index.tsx');
    const questionnaireStyle = readSource('miniapp/src/pages/questionnaire/index.scss');

    expect(questionnaireSource).toContain('questionnaire-toast');
    expect(questionnaireSource).toContain('showToast');
    expect(questionnaireSource).toContain('最多只能选');
    expect(questionnaireSource).toContain('toggleMultiWithLimit');
    expect(questionnaireSource).toContain('button-secondary questionnaire-actions__back');
    expect(questionnaireStyle).toMatch(/\.questionnaire-title\s*\{[\s\S]*font-size:\s*34px;/);
    expect(questionnaireStyle).toMatch(/\.questionnaire-option__label\s*\{[\s\S]*font-size:\s*18px;/);
    expect(questionnaireStyle).toMatch(/\.questionnaire-options\s*\{[\s\S]*grid-template-columns:\s*1fr;/);
    expect(questionnaireStyle).toContain('.questionnaire-toast');
    expect(questionnaireStyle).toContain('position: sticky;');
  });

  it('keeps report and about pages within the same compact scale', () => {
    const reportSource = readSource('miniapp/src/pages/report/index.tsx');
    const reportStyle = readSource('miniapp/src/pages/report/index.scss');
    const aboutStyle = readSource('miniapp/src/pages/about/index.scss');

    // v2 叙事流：检查新元素而非旧 section 标题
    expect(reportSource).toContain('verdict-card');     // v6 结论卡
    expect(reportSource).toContain('narrative-list');    // 叙事列表
    expect(reportSource).toContain('接下来只做两步');    // 行动建议（保留）
    expect(reportSource).not.toContain('为什么会这样劝你');
    expect(reportSource).not.toContain('你最容易后悔的点');
    expect(reportSource).not.toContain('方向对比');
    // v2 样式：叙事段落行高，TL;DR 样式
    expect(reportStyle).toMatch(/\.narrative-lead\s*\{[\s\S]*font-weight:\s*700;/);
    expect(reportStyle).toMatch(/\.verdict-card\s*\{/);
    expect(aboutStyle).toMatch(/\.about-title\s*\{[\s\S]*font-size:\s*28px;/);
    expect(aboutStyle).toMatch(/\.about-copy,[\s\S]*font-size:\s*22px;/);
  });
});
