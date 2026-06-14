# 高考专业方向决策工具 Project Handoff Bundle

- 日期：2026-06-14
- 项目目录：`/Users/husen/Documents/高考专业填报`
- 适用对象：接手继续做产品、设计、开发、迁移、上线准备的其他 AI / Agent / 外部协作者
- 当前结论：`Web MVP 已可构建` + `微信小程序骨架已初始化并可构建`

---

## 1. 项目一句话定义

这是一个面向 `高考考生 + 家长` 的 `专业方向决策辅助工具`。

核心不是替用户“拍板选专业”，而是把：

`主观偏好`
-> `家庭分歧`
-> `风险底线`
-> `方向组级市场现实`

放到同一套可解释框架里，最后输出：

1. 重点方向建议
2. 劝进 / 劝退式判断
3. 市场现实校验
4. 横向对比结论
5. 极短行动清单

---

## 2. 已确认的产品边界

### 2.1 P0 定位

1. 做 `决策工具`
2. 做 `方向组级分析`
3. 做 `考生为主、家长可参与` 的判断流程
4. 做 `报告式结果页`

### 2.2 P0 不做

1. 不做院校录取概率预测
2. 不做完整志愿填报系统
3. 不做“最适合专业”黑箱推荐
4. 不做重型第三方实时数据平台
5. 不做海量外部 API 依赖型系统

### 2.3 合规边界

本工具：

1. 仅用于 `专业方向决策辅助`
2. 不替代官方招生政策、院校章程与录取规则
3. 不承诺录取结果、就业结果、薪资结果
4. 不输出“唯一正确答案”

禁止宣传词：

1. 最适合
2. 最优解
3. 精准匹配
4. 保证不后悔
5. 一定更好就业
6. 一定更有前途

---

## 3. 已收敛的核心产品判断

### 3.1 结果页要像什么

用户明确反馈：报告不能像资料堆砌，必须像 `MBTI / 星座解析` 一样，一眼看到重点。

因此结果页已经朝这几个方向收敛：

1. 文案短
2. 重点强
3. 不讲空话
4. 不做字段解释
5. 改成更像“过来人 / 专家”的判断语气
6. 每个方向卡片改成 `劝进 / 劝退式判断`
7. 行动清单只保留 `2 到 3 刀`

### 3.2 问卷要像什么

用户明确反馈：不能每次都问一样的问题，必须有题库抽题。

因此当前逻辑是：

1. 题库不是单题固定写死
2. 通过题库结构 + 人格判定规则 V1 做抽题和归因
3. 仍然保持总流程短，避免完成率下降

### 3.3 市场现实要怎么接

用户明确提出：纯主观倾听内心不够，必须加入市场和就业现实。

当前策略不是做重型实时数据平台，而是：

1. 首版仍以 `方向组级` 为单位
2. 用结构化市场观察数据增强说服力
3. 先支持：
   - 报考热度变化
   - 就业面宽窄
   - 培养周期与试错成本
   - 城市集中度
   - 行业波动性
4. 首版先走 `本地结构化数据 + 清晰口径`
5. 后续再看是否接入更强数据源

---

## 4. 当前仓库结构

### 4.1 Web 主工程

技术栈：

1. Next.js 15
2. React 18
3. TypeScript
4. Tailwind CSS
5. Zod
6. Vitest

核心目录：

1. `app/`
2. `components/`
3. `data/`
4. `lib/`
5. `tests/`
6. `types/`

关键页面：

1. `app/page.tsx`
2. `app/questionnaire/page.tsx`
3. `app/report/page.tsx`

关键业务层：

1. `data/direction-groups.ts`
2. `data/questionnaire.ts`
3. `data/market-insights.ts`
4. `data/report-archetypes.ts`
5. `lib/scoring/scoring-rules.ts`
6. `lib/scoring/build-report.ts`
7. `lib/validation/questionnaire-schema.ts`
8. `lib/session/report-session.ts`

### 4.2 微信小程序工程

目录：

`/Users/husen/Documents/高考专业填报/miniapp`

技术路线：

1. Taro 4.2
2. React
3. TypeScript
4. Sass

关键文件：

1. `miniapp/src/pages/home/index.tsx`
2. `miniapp/src/pages/questionnaire/index.tsx`
3. `miniapp/src/pages/report/index.tsx`
4. `miniapp/src/pages/about/index.tsx`
5. `miniapp/src/lib/storage/report-storage.ts`
6. `miniapp/config/index.ts`
7. `miniapp/babel.config.js`
8. `miniapp/project.config.json`

说明：

1. 小程序业务层复用了 Web 版的题库、方向组、评分逻辑、校验逻辑
2. 当前是“能编译、能继续做”的骨架，不是最终上线态 UI

---

## 5. 当前已验证状态

以下结论是本次实际跑命令确认过的，不是推测。

### 5.1 Web 主工程

已通过：

1. `npm run typecheck`
2. `npm test`
3. `npm run build`

测试结果：

1. `9` 个测试文件通过
2. `18` 个测试通过

### 5.2 微信小程序工程

已通过：

1. `cd miniapp && npm run typecheck`
2. `cd miniapp && npm run build:weapp`

构建产物目录：

`/Users/husen/Documents/高考专业填报/miniapp/dist`

---

## 6. 本次开发阶段的重要修正

这是后续接手者最容易忽略、但实际踩过的坑。

### 6.1 Web 与 miniapp 共仓导致的构建冲突

问题：

根仓库 `tsconfig.json` 原本会把 `miniapp` 一起扫进去，导致 `next build` 被小程序代码影响。

处理：

已在根仓库 `tsconfig.json` 中把 `miniapp` 排除。

结论：

1. Web 和小程序现在可以在同一仓库并存
2. 后续不要把根 Web 配置随手改回全量扫描

### 6.2 Taro 初始化缺失依赖

实际补过的关键依赖 / 配置：

1. `@tarojs/webpack5-runner`
2. `babel-preset-taro`
3. `@babel/preset-react`
4. `miniapp/babel.config.js`

结论：

如果别的 AI 想“重搭一遍 miniapp”，不要省略这些项。

### 6.3 Tailwind 警告

问题：

小程序构建时会捡到上层 Tailwind 配置，产生 `content` 警告。

处理：

已增加：

`miniapp/tailwind.config.js`

---

## 7. 现阶段真实完成度判断

### 7.1 P0 已完成

1. Web MVP 闭环已存在
2. 问卷 -> 报告流程已存在
3. 方向组规则引擎已存在
4. 市场现实模块已有结构化数据承载
5. 测试与构建链已跑通
6. 微信小程序骨架已初始化并可构建

### 7.2 P0 未完成

1. 小程序端 UI 仍未做成最终可上线视觉
2. 真实外部市场数据还没有正式接入
3. 分享、埋点、运营承接还没做
4. 小程序端异常兜底、分享文案、状态页不完整
5. 报告内容虽然已优化，但还没有做成最终商用级表达体系

---

## 8. 继续推进时的优先级建议

### P0 路线

如果目标是尽快上线小程序，建议按这个顺序：

1. 先把 `miniapp` 页面 UI 做到微信小程序可上线水平
2. 再补小程序端缓存、异常态、空态、返回链路
3. 再补分享链路和基础埋点
4. 再决定是否接入更真实的数据源

### P1 路线

如果目标是提升决策价值，建议按这个顺序：

1. 补强方向组市场数据口径
2. 把报告文案继续“去 AI 味”
3. 做家长版输入或双人协商链路
4. 再考虑方向组下钻到具体专业

---

## 9. 强提醒：不要轻易改变的产品原则

### 9.1 不要退化成资料展示页

这个项目的核心价值是：

`帮用户做判断`

不是：

`帮用户看信息`

### 9.2 不要一上来做重运营数据产品

用户明确反感高维护方案。

默认原则：

1. 先做轻工具
2. 先做可落地
3. 先做可解释
4. 不要先做庞大数据仓

### 9.3 不要把 AI、自动化相关方向漏掉

这个点用户明确指出过。

当前处理方式：

1. AI 已并入 `计算机、数据与人工智能类`
2. 自动化、机器人、智能制造已并入 `工程、自动化与智能制造类`

### 9.4 不要把结果写成模板报告

用户对“机械、像网上资料堆叠”的内容非常敏感。

后续所有结果文案必须遵守：

1. 少字
2. 重判断
3. 有偏向
4. 有现实感
5. 像真人，不像模型

---

## 10. 推荐其他 AI 的阅读顺序

1. `2026-06-14-project-handoff-bundle.md`
2. `2026-06-08-major-direction-agent-handoff.md`
3. `2026-06-08-major-direction-mvp-checklist.md`
4. `2026-06-08-major-direction-decision-tool-design.md`
5. `2026-06-08-major-direction-implementation-plan.md`
6. `README.md`
7. `miniapp/README.md`

---

## 11. 可直接复制给其他 AI 的启动提示词

```md
请接手这个项目，并先读取以下文件作为唯一有效上下文：

1. /Users/husen/Documents/高考专业填报/2026-06-14-project-handoff-bundle.md
2. /Users/husen/Documents/高考专业填报/2026-06-08-major-direction-agent-handoff.md
3. /Users/husen/Documents/高考专业填报/2026-06-08-major-direction-mvp-checklist.md
4. /Users/husen/Documents/高考专业填报/2026-06-08-major-direction-decision-tool-design.md
5. /Users/husen/Documents/高考专业填报/2026-06-08-major-direction-implementation-plan.md

工作要求：
- 不要重新发散产品方向
- 保持“方向组级决策工具”定位
- 不要擅自扩展成院校录取概率系统
- 不要引入高维护、重运营的数据方案，除非明确要求
- 所有新增文件继续放在 /Users/husen/Documents/高考专业填报 目录内

当前状态：
- Web 主工程可 typecheck / test / build
- miniapp 小程序工程可 typecheck / build

优先任务：
- 优先继续完善 miniapp 页面与交互
- 或继续增强报告内容的人味、判断力和市场数据支撑
```

---

## 12. 本次打包包含哪些文件最关键

### 文档

1. `2026-06-14-project-handoff-bundle.md`
2. `2026-06-08-major-direction-agent-handoff.md`
3. `2026-06-08-major-direction-decision-tool-design.md`
4. `2026-06-08-major-direction-implementation-plan.md`
5. `2026-06-08-major-direction-mvp-checklist.md`
6. `README.md`
7. `miniapp/README.md`

### 建议同时给其他 AI 的源码目录

1. `app/`
2. `components/`
3. `data/`
4. `lib/`
5. `tests/`
6. `types/`
7. `miniapp/src/`
8. `miniapp/config/`

---

## 13. 当前最值得做的下一步

如果目标是继续推进而不是重新讨论，最推荐的就是这一条：

`把 miniapp 做成真正可用的微信小程序首版`

对应落地方向：

1. 重做小程序端视觉与排版
2. 调整问卷交互节奏
3. 收紧结果页结构
4. 增加分享、缓存、异常态
5. 再决定要不要补真实数据源
