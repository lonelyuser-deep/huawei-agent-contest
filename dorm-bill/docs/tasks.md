# 宿舍账单管家 - 开发任务列表

> 版本: 1.1.0  
> 更新日期: 2026-10-10  
> 状态标记: [x] 已完成 / [ ] 待开发

---

## Phase 1: 基础功能（已完成）

- [x] T001 项目脚手架搭建 (Vue3 + Vite + TS)
- [x] T002 类型定义 (bill.ts, roommate.ts)
- [x] T003 数据存储工具 (storage.ts)
- [x] T004 侧边导航栏组件 (NavSidebar.vue)
- [x] T005 账单卡片组件 (BillCard.vue)
- [x] T006 首页/账单总览 (Home.vue)
- [x] T007 添加账单页面 (AddBill.vue)
- [x] T008 账单详情页面 (BillDetail.vue)
- [x] T009 智能分摊页面 (Split.vue)
- [x] T010 室友管理页面 (Roommates.vue)
- [x] T011 设置页面 (Settings.vue)

## Phase 2: AI 智能识别（已完成）

- [x] T012 OCR 智能账单解析 (ocr.ts + OcrUpload.vue)
- [x] T013 NLP 语义记账 (nlp.ts + NlpInput.vue)
- [x] T014 宿舍公平度算法
- [x] T015 AI 推荐转账方案

---

## Phase 3: 个人月度预算与超支预警（新增）

### 3.1 数据层

- [ ] T016 创建预算类型定义 (`src/types/budget.ts`)
  - BudgetSettings 接口
  - BudgetRecord 接口
  - BudgetStatus 接口

- [ ] T017 扩展存储工具 (`src/utils/storage.ts`)
  - `loadBudgetSettings()` 读取预算配置
  - `saveBudgetSettings()` 保存预算配置
  - `loadBudgetRecords()` 读取月度记录
  - `saveBudgetRecord()` 保存月度记录
  - `getMonthSpent()` 计算指定月份已消费总额

### 3.2 API 层

- [ ] T018 创建预算管理 API (`src/api/budgetApi.ts`)
  - `getBudgetSettings()` 获取预算设置
  - `updateBudgetSettings()` 更新预算设置
  - `getBudgetStatus()` 获取本月预算状态（已消费、比例、状态）
  - `getBudgetHistory()` 获取历史预算记录

### 3.3 前端组件

- [ ] T019 创建预算警告条组件 (`src/components/BudgetWarning.vue`)
  - 黄色警告条（≥80% 预算）
  - 红色警告条（>100% 预算）
  - 超支弹窗提醒
  - Props: spent, budget, threshold
  - Events: exceeded

- [ ] T020 创建预算进度条组件 (`src/components/BudgetProgress.vue`)
  - 可视化进度条
  - 已消费/预算金额显示
  - 百分比标注
  - 颜色随比例变化（绿→黄→红）

### 3.4 页面集成

- [ ] T021 修改首页 (`src/views/Home.vue`)
  - 顶部添加 BudgetWarning 组件
  - 统计区下方添加 BudgetProgress 组件
  - 预算数据实时计算

- [ ] T022 修改设置页 (`src/views/Settings.vue`)
  - 新增"预算管理"区块
  - 月度预算输入框
  - 预警阈值滑块（默认 80%）
  - 按类别预算设置（可折叠）
  - 启用/禁用开关

---

## Phase 4: AI 智能省钱建议（新增）

### 4.1 数据层

- [ ] T023 创建省钱建议类型定义 (`src/types/suggestion.ts`)
  - SavingTip 接口
  - SavingRule 接口
  - SuggestionFeedback 接口

### 4.2 API 层

- [ ] T024 创建省钱建议引擎 (`src/api/suggestionApi.ts`)
  - 规则引擎框架（SavingRule 接口）
  - 内置规则：外卖频次规则 (food-frequency)
  - 内置规则：奶茶占比规则 (milk-tea-ratio)
  - 内置规则：电费偏高规则 (electricity-high)
  - 内置规则：夜宵零食规则 (snack-frequency)
  - 内置规则：消费趋势规则 (trend-rising)
  - `generateSuggestions()` 生成建议列表
  - `generateAISuggestions()` 大模型接口（预留）

- [ ] T025 建议反馈存储
  - `saveSuggestionFeedback()` 保存用户反馈
  - `loadSuggestionFeedback()` 读取反馈历史

### 4.3 前端组件

- [ ] T026 创建省钱小助手卡片 (`src/components/SavingTipsCard.vue`)
  - 建议列表展示
  - 每条建议：图标 + 标题 + 描述 + 预计可省
  - 用户反馈按钮（👍/👎）
  - 无数据时友好提示
  - 建议展开/收起

### 4.4 页面集成

- [ ] T027 修改首页 (`src/views/Home.vue`)
  - 添加 SavingTipsCard 组件
  - 传入账单数据
  - 建议数据实时更新

---

## Phase 5: 测试与优化

- [ ] T028 预算预警功能测试
  - 测试 80% 阈值黄色警告
  - 测试 100% 超支红色警告 + 弹窗
  - 测试预算修改后实时更新
  - 测试刷新后数据持久化

- [ ] T029 省钱建议功能测试
  - 测试各规则触发条件
  - 测试无数据时的空状态
  - 测试建议反馈功能
  - 测试多规则同时触发

- [ ] T030 移动端适配
  - 预算警告条响应式
  - 预算进度条响应式
  - 省钱卡片响应式

- [ ] T031 性能优化
  - 预算计算防抖
  - 建议生成缓存
  - 避免重复计算

---

## Phase 6: 后续扩展（预留）

- [ ] T032 接入华为云 ModelArts 大模型生成个性化省钱建议
- [ ] T032 按类别分别设置预算上限
- [ ] T034 预算历史趋势图表
- [ ] T035 消费数据导出为 Excel
- [ ] T036 微信小程序版本适配

---

## 任务依赖关系

```
T016 (类型定义) ──┬──> T017 (存储工具) ──> T018 (API) ──┬──> T019 (警告条)
                   │                                      ├──> T020 (进度条)
                   │                                      ├──> T021 (首页集成)
                   │                                      └──> T022 (设置页集成)
                   │
T023 (建议类型)  ──┴──> T024 (建议引擎) ──> T025 (反馈存储)
                                              └──> T026 (省钱卡片) ──> T027 (首页集成)

T019 + T020 + T026 ──> T021 + T027 ──> T028 + T029 ──> T030 + T031
```

## 开发优先级

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | T016-T022 | 预算预警功能（核心） |
| P0 | T023-T027 | 省钱建议功能（核心） |
| P1 | T028-T031 | 测试与优化 |
| P2 | T032-T036 | 后续扩展 |