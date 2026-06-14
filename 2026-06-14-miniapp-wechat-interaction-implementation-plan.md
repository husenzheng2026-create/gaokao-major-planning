# Miniapp WeChat Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `miniapp` 的首页、问卷页、报告页改成更像微信小程序实用工具的交互节奏和视觉结构。

**Architecture:** 不改评分规则和数据结构，只重构 `miniapp/src/pages/*` 与 `miniapp/src/app.scss` 的页面层。问卷页保留现有数据流，新增“单选自动切题、多选继续”的轻流程；首页与报告页改成更强卡片层级和单主动作结构。

**Tech Stack:** Taro 4.2、React、TypeScript、Sass

---

## 文件范围

- Modify: `miniapp/src/app.scss`
- Modify: `miniapp/src/pages/home/index.tsx`
- Modify: `miniapp/src/pages/home/index.scss`
- Modify: `miniapp/src/pages/questionnaire/index.tsx`
- Modify: `miniapp/src/pages/questionnaire/index.scss`
- Modify: `miniapp/src/pages/report/index.tsx`
- Modify: `miniapp/src/pages/report/index.scss`

## 任务拆分

### Task 1: 重设全局视觉基调
- [ ] 收紧 `page-shell`、`card`、按钮样式，做成浅底轻卡片
- [ ] 增加统一的辅助类，给页面头部、标签、底部固定区复用
- [ ] 跑 `cd miniapp && npm run typecheck`

### Task 2: 首页工具化
- [ ] 首页改成“一屏强入口”
- [ ] 把长说明压成 2 到 3 条短信任信息
- [ ] 主按钮改成“开始 3 分钟诊断”
- [ ] 次按钮弱化成“查看说明”

### Task 3: 问卷改成单题即走
- [ ] 为单选题加入自动切题逻辑
- [ ] 多选题保留底部继续按钮
- [ ] 顶部进度区压缩
- [ ] 底部操作区固定，更像小程序

### Task 4: 报告首屏重排
- [ ] 首屏改成“类型标签 + 为什么会这样”
- [ ] 第二层再给方向判断卡
- [ ] 现实层和行动清单压成更清晰的卡片流

### Task 5: 验收
- [ ] 跑 `cd miniapp && npm run typecheck`
- [ ] 跑 `cd miniapp && npm run build:weapp`
- [ ] 复查根仓库 `npm run build`，确认 `miniapp` 不再影响 Web 构建
