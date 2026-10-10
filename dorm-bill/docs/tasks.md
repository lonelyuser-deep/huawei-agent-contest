# 宿舍账单管家 - 开发任务列表

> 版本: 1.2.0  
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

## Phase 3: 个人月度预算与超支预警（已完成）

- [x] T016 创建预算类型定义 (`src/types/budget.ts`)
- [x] T017 扩展存储工具 (`src/utils/storage.ts`)
- [x] T018 创建预算管理 API (`src/api/budgetApi.ts`)
- [x] T019 创建预算警告条组件 (`src/components/BudgetWarning.vue`)
- [x] T020 创建预算进度条组件 (`src/components/BudgetProgress.vue`)
- [x] T021 修改首页 (`src/views/Home.vue`)
- [x] T022 修改设置页 (`src/views/Settings.vue`)

---

## Phase 4: AI 智能省钱建议（已完成）

- [x] T023 创建省钱建议类型定义 (`src/types/suggestion.ts`)
- [x] T024 创建省钱建议引擎 (`src/api/suggestionApi.ts`)
- [x] T025 建议反馈存储
- [x] T026 创建省钱小助手卡片 (`src/components/SavingTipsCard.vue`)
- [x] T027 修改首页 (`src/views/Home.vue`)

---

## Phase 5: 智能攒钱小助手（新增·核心）

### 5.1 数据层

- [ ] T028 创建储蓄目标类型定义 (`src/types/savings.ts`)
  - SavingsGoal 接口（goalName, targetAmount, currentAmount, deadline, isActive, status）
  - SavingsRecord 接口（goalId, amount, source, description, month）

- [ ] T029 扩展存储工具 - 储蓄数据存取
  - `loadSavingsGoals()` 读取储蓄目标列表
  - `saveSavingsGoals()` 保存储蓄目标列表
  - `loadSavingsRecords()` 读取储蓄记录
  - `saveSavingsRecord()` 保存单条储蓄记录

### 5.2 API 层

- [ ] T030 创建储蓄管理 API (`src/api/savingsApi.ts`)
  - `getSavingsGoals()` 获取所有目标
  - `getActiveGoal()` 获取当前活跃目标
  - `createGoal()` 创建新目标
  - `updateGoal()` / `deleteGoal()` 更新/删除目标
  - `deposit()` 手动存入金额
  - `getSavingsRecords()` 获取历史记录

- [ ] T031 实现预算结余联动（核心）
  - `applyBudgetSurplus()` 计算本月结余并自动存入
  - 生成联动消息："本月结余 ¥X，已加入'{目标名}'进度！"
  - 防重复：同月同源只存一次

- [ ] T032 实现建议采纳联动（核心）
  - `adoptSuggestion()` 采纳建议，预计可省 × 50% 存入
  - 生成联动消息："采纳省钱建议，{目标名}进度 +¥X！"
  - 标记建议已采纳，避免重复存入

- [ ] T033 实现类别消费减少联动（核心）
  - `checkCategoryReduction()` 检测环比下降 > 30%
  - 差额按比例存入储蓄
  - 生成联动消息："这个月少喝了N杯奶茶，{目标名}进度 +¥X！"

- [ ] T034 目标达成检测
  - `checkGoalCompletion()` 检查 current >= target
  - 达成时更新状态为 completed
  - 触发祝贺弹窗事件

### 5.3 前端组件

- [ ] T035 创建智能攒钱小助手卡片 (`src/components/SmartSavingCard.vue`)
  - 储蓄目标进度条（目标名、已存/目标、百分比、截止日期）
  - 联动消息列表（实时显示最近的攒钱消息）
  - AI 省钱建议列表（含"采纳建议"按钮）
  - 手动存入弹窗
  - 目标设定/切换弹窗
  - 达成目标祝贺弹窗

### 5.4 页面集成

- [ ] T036 修改首页 (`src/views/Home.vue`)
  - 添加 SmartSavingCard 组件
  - 传入 bills 和 budgetStatus
  - 处理 goalCompleted 事件

- [ ] T037 修改设置页 (`src/views/Settings.vue`)
  - 新增"储蓄目标管理"区块
  - 创建/编辑/删除目标
  - 切换活跃目标
  - 查看储蓄历史记录

---

## Phase 6: 测试与优化

- [ ] T038 预算预警功能测试
  - 测试 80% 阈值黄色警告
  - 测试 100% 超支红色警告 + 弹窗
  - 测试预算修改后实时更新
  - 测试刷新后数据持久化

- [ ] T039 省钱建议功能测试
  - 测试各规则触发条件
  - 测试无数据时的空状态
  - 测试建议反馈功能
  - 测试多规则同时触发

- [ ] T040 智能攒钱功能测试
  - 测试储蓄目标创建和进度显示
  - 测试预算结余自动存入联动
  - 测试建议采纳联动存入
  - 测试类别消费减少联动
  - 测试目标达成弹窗
  - 测试联动消息正确显示

- [ ] T041 移动端适配
  - 预算警告条响应式
  - 预算进度条响应式
  - 省钱卡片响应式

- [ ] T042 性能优化
  - 预算计算防抖
  - 建议生成缓存
  - 避免重复计算

---

## Phase 7: 后续扩展（预留）

- [ ] T043 接入华为云 ModelArts 大模型生成个性化省钱建议
- [ ] T044 按类别分别设置预算上限
- [ ] T045 预算历史趋势图表
- [ ] T046 消费数据导出为 Excel
- [ ] T047 微信小程序版本适配
- [ ] T048 多储蓄目标并行管理和优先级

---

## 任务依赖关系

```
T028 (储蓄类型) ──> T029 (存储工具) ──> T030 (储蓄API)
                                           │
                     T031 (结余联动) ───────┤
                     T032 (建议联动) ───────┤
                     T033 (类别联动) ───────┤
                     T034 (达成检测) ───────┤
                                           ▼
                     T035 (攒钱卡片) ──> T036 (首页集成)
                                     └──> T037 (设置页集成)

T035 + T036 + T037 ──> T040 (攒钱测试) ──> T041 + T042
```

## 开发优先级

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | T028-T037 | 智能攒钱小助手（核心功能） |
| P1 | T038-T042 | 测试与优化 |
| P2 | T043-T048 | 后续扩展 |