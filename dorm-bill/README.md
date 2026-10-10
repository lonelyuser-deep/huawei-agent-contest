# 宿舍账单管家 (Dorm Bill Helper)

> 针对大学生宿舍生活中"水电杂费分摊易扯皮"、"生活账单记录繁琐"、"公共物品管理混乱"等痛点，基于华为云 CodeArts 全生命周期软件开发服务，开发的一款集 OCR 智能识别、NLP 语义记账、AI 决策推荐于一体的轻量级 Web 应用。

## 核心功能

### 📸 智能账单解析 (OCR)
调用华为云 ModelArts 的 OCR（光学字符识别）能力，一键提取电费、水费、外卖订单截图中的金额与明细，杜绝人工输入误差。

### 🗣️ NLP 语义记账
集成华为云自然语言处理（NLP）服务，支持用户输入"今天帮室友带了15元的奶茶"等自然语言，AI 自动识别语义、提取人名与金额并自动归类记账。

### ⚖️ 宿舍公平决策系统
基于历史消费数据，利用 AI 算法计算"宿舍公平度"，智能推荐最优的分摊方案和转账建议。

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **路由**: Vue Router 4
- **云服务**: 华为云 ModelArts OCR + NLP
- **开发平台**: 华为云 CodeArts

## 项目结构

```
dorm-bill/
├── src/
│   ├── api/
│   │   ├── ocr.ts              # OCR 智能识别服务
│   │   └── nlp.ts              # NLP 语义解析服务
│   ├── components/
│   │   ├── NavSidebar.vue      # 侧边导航栏
│   │   ├── BillCard.vue        # 账单卡片
│   │   ├── OcrUpload.vue       # OCR 上传组件
│   │   └── NlpInput.vue        # NLP 输入组件
│   ├── views/
│   │   ├── Home.vue            # 账单总览首页
│   │   ├── AddBill.vue         # 添加账单（手动/OCR/NLP）
│   │   ├── BillDetail.vue      # 账单详情
│   │   ├── Split.vue           # 智能分摊与公平度
│   │   ├── Roommates.vue       # 室友管理
│   │   └── Settings.vue        # 设置
│   ├── types/
│   │   ├── bill.ts             # 账单类型定义
│   │   └── roommate.ts         # 室友类型定义
│   ├── utils/
│   │   └── storage.ts          # 数据存储与分摊算法
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 快速开始

```bash
cd dorm-bill
npm install
npm run dev
```

## 功能页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 账单总览 | `/` | 统计概览 + 最近账单列表 |
| 添加账单 | `/add` | 手动输入 / OCR识别 / 语义记账 |
| 账单详情 | `/detail/:id` | 查看账单明细和分摊情况 |
| 智能分摊 | `/split` | 公平度评分 + AI转账方案 |
| 室友管理 | `/roommates` | 添加/删除室友 |
| 设置 | `/settings` | 华为云服务配置 + 数据管理 |

## 开发说明

- 数据存储使用 localStorage，无需后端
- OCR/NLP 服务支持模拟模式，配置华为云后可获取真实识别结果
- 分摊算法支持均摊和自定义两种模式
- 公平度评分基于个人支付与应付差额计算