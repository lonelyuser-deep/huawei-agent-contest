# 校园快递助手 📦

> 华为 agent 参赛项目 — HarmonyOS NEXT 原生应用，面向校园生活服务

## 项目简介

帮助大学生解决取快递时多个取件码混乱、难以清晰判断哪些快递还未取件的痛点。通过**通知监听自动录入**、**粘贴板智能检测**、**地图导航**和**日程提醒**，让取快递变成随手就能完成的小任务。

## 核心亮点

- 🔔 **通知监听自动录入**：监听淘宝/菜鸟/京东等 App 的快递通知，自动解析取件码，无需手动操作
- 📋 **粘贴板智能检测**：打开 App 自动检测粘贴板，识别到快递信息自动填入
- 🗺️ **地图导航**：驿站位置标记，一键拉起系统地图导航
- ⏰ **日程提醒**：通过系统提醒服务设置取件提醒，到点自动通知
- 📊 **看板式管理**：待取/已取分类展示，一目了然

## 功能特性

### ✅ 已实现（v1.0 Demo）

| 功能 | 说明 |
|------|------|
| 快递看板 | 待取/已取分类列表 + 顶部统计 + 一键取件 |
| 智能录入 | 粘贴板自动检测 + 自然语言解析快递通知 |
| 手动填写 | 表单输入，快递公司选择器 |
| 详情管理 | 查看/标记取件/取消标记/删除 |
| 通知监听 | NotificationListener 服务自动捕获快递通知 |
| 提醒服务 | ReminderAgent 定时提醒 + 日历提醒 |

### 🔜 规划中

- 截图 OCR 识别取件码
- 地图组件集成驿站定位
- 接入 AI Agent 实现多轮对话
- 扩展模块：食堂导航、学习助手、校园出行

## 技术栈

- **HarmonyOS NEXT** 原生开发（ArkTS + ArkUI）
- 本地存储（PreferencesHelper）
- 通知监听（NotificationListenerAbility）
- 提醒服务（ReminderAgent）
- 规则引擎解析自然语言

## 项目结构

```
├── AppScope/
│   └── app.json5                         # 应用全局配置
├── entry/
│   └── src/main/
│       ├── ets/
│       │   ├── entryability/
│       │   │   └── EntryAbility.ets      # 入口 Ability
│       │   ├── pages/
│       │   │   ├── Index.ets             # 首页 - 快递看板
│       │   │   ├── AddExpress.ets        # 添加页 - 智能录入 + 手动表单
│       │   │   └── ExpressDetail.ets     # 详情页 - 查看/标记/删除/导航
│       │   ├── model/
│       │   │   └── ExpressData.ets       # 数据模型
│       │   ├── utils/
│       │   │   ├── ExpressStorage.ets    # 本地存储工具
│       │   │   └── NotificationParser.ets # 通知/文本解析工具
│       │   └── service/
│       │       ├── NotificationListenerAbility.ets # 通知监听服务
│       │       └── ReminderService.ets   # 提醒服务
│       ├── resources/
│       │   └── base/
│       │       ├── element/              # 字符串/颜色资源
│       │       └── profile/             # 页面路由配置
│       └── module.json5                  # 模块配置 + 权限声明
├── build-profile.json5                   # 构建配置
├── oh-package.json5                      # 包配置
└── hvigorfile.ts                         # 构建脚本
```

## 权限说明

| 权限 | 用途 |
|------|------|
| NOTIFICATION_CONTROLLER | 监听快递通知自动录入取件码 |
| LOCATION | 地图导航到快递驿站 |
| READ/WRITE_CALENDAR | 设置取件提醒日程 |

## 使用方法

1. 下载 [DevEco Studio](https://developer.harmonyos.com/cn/develop/deveco-studio/)
2. 导入本项目目录
3. 编译运行到鸿蒙模拟器或真机
4. 在系统设置中开启通知监听权限

## 开发说明

- 需要 HarmonyOS NEXT SDK (API 10+)
- 通知监听需用户在系统设置中手动授权
- 数据存储在本地 Preferences，无需后端
- 后续接入 AI Agent 时，在 `utils/` 下新增 `AgentService.ets` 调用码道模型 API
