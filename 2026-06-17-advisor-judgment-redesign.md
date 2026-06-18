# 顾问式建议系统改造设计

- 日期：2026-06-17
- 项目目录：`/Users/husen/Documents/高考专业填报`
- 目标：把第一版报告里的“方向建议”从字段解释型，升级成更像升学顾问的判断型输出

---

## 1. 本次要解决的问题

当前报告的主要问题，不是没有信息，而是：

1. 理由不够真，不像懂行的人在劝
2. 行动建议太虚，但这轮优先级更高的是先把“方向卡判断”做对

用户已明确选择：

1. 风格像 `见过很多学生的升学顾问`
2. 语气 `务实、直接、不端着`
3. 判断重点围绕 `以后会不会后悔`

---

## 2. 这轮不改什么

本次不追求：

1. 做完整小程序上线面
2. 引入更重的外部市场数据链路
3. 做自由生成式长文案
4. 一次性解决所有报告模块的人味问题

本次只解决：

`推荐方向卡里的建议`
-> `更像顾问在帮用户避免错配和后悔`

---

## 3. 目标输出长什么样

每张方向卡不再主要回答：

`这个方向有什么特点`

而是回答：

1. 你为什么会被它吸引
2. 你以后最可能因为什么后悔
3. 你和它真正错配的地方在哪

---

## 4. 三类方向卡的角色定义

### 4.1 现在优先押

这类卡不是夸它最好，而是：

`它最不容易让你后面后悔`

顾问动作：

`先集中注意力`

### 4.2 可以留

这类卡不是鼓励，而是：

`它值得保留，但还不能太早自信`

顾问动作：

`先保留观察位`

### 4.3 先别碰

这类卡不是否定方向，而是：

`现在把它排太前，后面更容易吃亏的是你自己`

顾问动作：

`先踩刹车，帮你止损`

---

## 5. 每张卡的固定输出结构

第一版固定 4 句，不做大段发挥：

1. `decisionLine`
   - 一句判断
2. `attractionLine`
   - 解释用户为什么会被它吸引
3. `regretLine`
   - 预判以后最可能因为什么后悔
4. `mismatchLine`
   - 点破真正的错配点

这样前端渲染时不会再变成“字段解释串联”。

---

## 6. 建议系统的底层逻辑

### 6.1 不按“专业介绍”驱动

第一版不按“某个方向的百科说明”驱动，而是按：

`用户最容易出现哪种误判`

来生成判断。

### 6.2 先抽象 6 类高频后悔矛盾

1. `hotness-misread`
   - 把热度当成适合度
2. `long-training-mismatch`
   - 不愿付长培养周期，却选了长培养方向
3. `stability-illusion`
   - 以为稳，实际上门槛和分化不低
4. `interest-imagination-gap`
   - 喜欢的是想象，不是现实工作方式
5. `cost-tolerance-mismatch`
   - 方向没问题，但它的代价正好是用户最抗拒的
6. `path-ambiguity-anxiety`
   - 用户需要清晰路径，但方向天然分化大

### 6.3 生成流程

流程建议：

`先定卡片角色`
-> `再识别主错配类型`
-> `最后套模板生成 4 句判断`

---

## 7. 现有数据怎么映射

### 7.1 用户吸引点来源

可直接用现有字段：

1. `topFactors`
2. `nonNegotiableFactor`
3. `futurePath`
4. `selectedDirections`

### 7.2 后悔点来源

优先用：

1. `rejectedRisks`
2. `trainingCycleAcceptance`
3. `longTermTradeoffAcceptance`
4. `studyPressure`
5. `advancedDegreeDependency`
6. `industryVolatility`
7. `cityConcentration`
8. `platformDependency`

### 7.3 错配点来源

本质是：

`用户最不能承受的代价`
vs
`该方向最核心的代价`

如果两者正面撞上，就不是“不适合读”，而是：

`排太前会更容易后悔`

---

## 8. 模板策略

### 8.1 第一层：角色模板

按卡片角色定语气：

1. `push`
2. `keep`
3. `avoid`

它决定：

1. 是收拢
2. 是保留
3. 还是止损

### 8.2 第二层：错配模板

按后悔矛盾类型定内容：

1. 后悔点怎么说
2. 错配点怎么说

### 8.3 第三层：变量填充

只填 3 类核心变量：

1. `direction`
2. `userPriority`
3. `directionCost`

第一版不要塞更多变量，避免模板味和拼接错乱。

---

## 9. 代码改造范围

### 必改文件

1. `types/assessment.ts`
   - 新增顾问式方向卡结构
2. `lib/scoring/build-report.ts`
   - 接入顾问式建议生成
3. `components/report/recommended-direction-card.tsx`
   - 改成渲染新的 4 段判断
4. `tests/scoring/build-report.test.ts`
   - 新增结构和角色差异测试

### 建议新增文件

5. `lib/scoring/advisor-copy.ts`
   - 放模板、错配识别、文案拼装逻辑

---

## 10. 结构设计

建议新增：

```ts
interface AdvisorDirectionCard {
  decisionLine: string;
  attractionLine: string;
  regretLine: string;
  mismatchLine: string;
  mismatchType:
    | 'hotness-misread'
    | 'long-training-mismatch'
    | 'stability-illusion'
    | 'interest-imagination-gap'
    | 'cost-tolerance-mismatch'
    | 'path-ambiguity-anxiety';
}
```

然后把它挂到现有推荐方向结构上：

```ts
advisorCard: AdvisorDirectionCard;
```

---

## 11. 前端展示顺序

`recommended-direction-card` 建议改成：

1. badge
2. 方向标题
3. `decisionLine`
4. `attractionLine`
5. `regretLine`
6. `mismatchLine`

原来的：

1. `fitSummary`
2. `reasons`
3. `cautionSummary`

可以先退成次级内容，甚至第一版先不展示。

---

## 12. 测试要求

### 12.1 结构测试

验证每个推荐方向都有：

1. `advisorCard`
2. `decisionLine`
3. `attractionLine`
4. `regretLine`
5. `mismatchLine`

### 12.2 角色差异测试

验证：

1. `primary` 更偏收拢
2. `secondary` 更偏保留
3. `avoidFirst` 更偏止损

### 12.3 错配识别测试

至少覆盖：

1. 长培养周期抗拒
2. 热度误判
3. 稳定幻想

---

## 13. 验收标准

改造完成后，至少满足：

1. 方向卡读起来像判断，不像字段说明
2. 三类卡的语气明显不同
3. 每张卡都能回答“为什么会被吸引”和“为什么以后会后悔”
4. 不依赖外部接口即可稳定产出
5. `npm test`
6. `npm run build`
7. 小程序若复用该结构，不应破坏当前渲染链路

---

## 14. 风险与注意事项

1. 文案不能写得太满，避免像“系统装懂”
2. “像顾问”不等于“像教训人”
3. 先别碰类卡片要有止损感，但不能把用户吓跑
4. 第一版重在稳定和区分度，不重在文采
5. 不要把家长协作、真实市场数据、分享链路一起混进这轮

---

## 15. 推荐实施顺序

1. 先补类型
2. 再抽 `advisor-copy.ts`
3. 再接到 `build-report.ts`
4. 先补测试
5. 最后改前端卡片渲染
