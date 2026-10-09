# 校园快递助手 📦

> 华为 agent 参赛项目 — 鸿蒙 + Web 双端，面向校园生活服务

## 项目简介

帮助大学生解决取快递时多个取件码混乱、难以清晰判断哪些快递还未取件的痛点。通过**通知监听自动录入**、**粘贴板智能检测**、**地图导航**和**日程提醒**，让取快递变成随手就能完成的小任务。

## Monorepo 结构

```
huawei-agent-contest/
├── harmonyos/              # 鸿蒙 HarmonyOS NEXT 版（ArkTS + ArkUI）
│   ├── entry/              # 主模块（页面/服务/工具/模型）
│   ├── AppScope/           # 应用全局配置
│   └── build-profile.json5 # 构建配置
├── web/                    # Web 版（Vue3 + Vite + TypeScript）
│   ├── src/
│   │   ├── views/          # 页面（Home/AddExpress/Detail）
│   │   ├── components/     # 组件（ExpressCard）
│   │   ├── utils/          # 本地存储
│   │   └── router/         # 路由
│   ├── index.html
│   └── package.json
├── shared/                 # 两端共享代码
│   ├── types/express.ts   # 数据模型定义
│   └── parser/             # 通知解析逻辑
└── README.md
```

## 如何查看 / 运行

### 📱 鸿蒙版

```bash
# 用 DevEco Studio 打开 harmonyos/ 目录
# File > Open > 选择 harmonyos/
# 点 Run ▶ 运行到模拟器或真机
```

### 🌐 Web 版

```bash
cd web
npm install      # 安装依赖
npm run dev      # 启动开发服务器 → 浏览器打开 http://localhost:5173
npm run build    # 打包构建 → dist/
npm run preview  # 预览构建结果
```

### 📦 共享代码

`shared/` 目录两端共用：
- 鸿蒙端：`import { parseNotification } from '../shared/parser/notificationParser'`
- Web 端：`import { parseNotification } from '@shared/parser/notificationParser'`

## 功能特性

| 功能 | 鸿蒙版 | Web版 |
|------|--------|-------|
| 快递看板 | ✅ | ✅ |
| 智能录入（粘贴板检测） | ✅ | ✅ |
| 手动填写 | ✅ | ✅ |
| 详情管理 | ✅ | ✅ |
| 通知监听自动录入 | ✅ | ❌（浏览器限制） |
| 提醒服务 | ✅ | ❌ |
| 地图导航 | 🔜 | 🔜 |

## 技术栈

- **鸿蒙版**：HarmonyOS NEXT（ArkTS + ArkUI），PreferencesHelper 存储，NotificationListener + ReminderAgent
- **Web版**：Vue3 + Vite + TypeScript，localStorage 存储
- **共享**：纯 TypeScript（数据模型 + 通知解析）

## 权限说明（鸿蒙版）

| 权限 | 用途 |
|------|------|
| NOTIFICATION_CONTROLLER | 监听快递通知自动录入 |
| LOCATION | 地图导航到驿站 |
| READ/WRITE_CALENDAR | 设置取件提醒 |
