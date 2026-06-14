# miniapp

这是当前仓库对应的微信小程序工程骨架，技术路线为 `Taro + React + TypeScript`。

## 目录说明

- `src/pages`：小程序页面
- `src/data` / `src/lib` / `src/types`：从现有 Web 版迁移过来的业务层
- `src/lib/storage/report-storage.ts`：小程序本地缓存封装

## 启动方式

```bash
cd miniapp
npm install
npm run dev:weapp
```

然后用微信开发者工具打开 `miniapp/dist`。

## 当前状态

- 已起小程序工程骨架
- 已接入问卷 / 报告 / 数据来源页面入口
- 已预留业务层复用位
- 下一步需要继续补问卷页和报告页完整 UI
