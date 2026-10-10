# 宿舍账单管家 - 技术设计文档 (TDD)

> 版本: 1.2.0  
> 更新日期: 2026-10-10  
> 变更: 整合「智能攒钱小助手」——储蓄目标 + 进度可视化 + 省钱联动

---

## 1. 系统架构

```
┌─────────────────────────────────────────────────┐
│                   前端 (Vue3 + TS)               │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ 账单管理  │ │ 预算预警  │ │  智能攒钱小助手  │ │
│  │ (已有)    │ │ (已有)   │ │  (新增·核心)    │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│        │            │              │              │
│  ┌─────┴────────────┴──────────────┴──────────┐  │
│  │          Composables / Stores              │  │
│  │  useBudget()  useSuggestions()  useBills()  │  │
│  └────────────────────────────────────────────┘  │
│        │            │              │              │
│  ┌─────┴────────────┴──────────────┴──────────┐  │
│  │              API Service Layer              │  │
│  │  budgetApi   suggestionApi   savingsApi      │  │
│  │  ocrApi  nlpApi                              │  │
│  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────┐
│              数据层 (localStorage / 后端)        │
│  bills  roommates  budget_settings  savings_goals │
│  suggestions  savings_records                     │
└─────────────────────────────────────────────────┘
```

## 2. 数据库设计

### 2.1 现有数据结构（localStorage）

- `dorm_bills` - 账单列表
- `dorm_roommates` - 室友列表
- `dorm_config` - 华为云服务配置

### 2.2 新增数据结构

#### budget_settings（预算设置）

```typescript
interface BudgetSettings {
  monthlyBudget: number          // 月度总预算（元），默认 1500
  categoryBudgets: {             // 按类别预算（可选）
    electricity?: number
    water?: number
    food?: number
    goods?: number
    other?: number
  }
  alertThreshold: number         // 预警阈值百分比，默认 80
  enabled: boolean               // 是否启用预算预警
}
```

存储 key: `dorm_budget_settings`

#### budget_records（预算月度记录）

```typescript
interface BudgetRecord {
  id: string
  year: number
  month: number          // 1-12
  budget: number         // 当月预算
  actualSpent: number    // 实际消费
  status: 'normal' | 'warning' | 'exceeded'
  createdAt: number
}
```

存储 key: `dorm_budget_records`

#### suggestion_feedback（建议反馈）

```typescript
interface SuggestionFeedback {
  suggestionId: string
  useful: boolean        // true=点赞, false=点踩
  createdAt: number
}
```

存储 key: `dorm_suggestion_feedback`

#### savings_goals（储蓄目标）

```typescript
interface SavingsGoal {
  id: string
  goalName: string             // 目标名称，如"买电脑"
  targetAmount: number         // 目标金额
  currentAmount: number        // 已存金额
  deadline: string             // 截止日期 YYYY-MM-DD
  isActive: boolean            // 是否当前活跃目标
  status: 'active' | 'completed' | 'archived'
  createdAt: number
  updatedAt: number
}
```

存储 key: `dorm_savings_goals`

#### savings_records（储蓄记录）

```typescript
interface SavingsRecord {
  id: string
  goalId: string               // 关联目标 ID
  amount: number               // 存入金额
  source: 'budget_surplus' | 'suggestion_adopted' | 'category_reduction' | 'manual'
  description: string          // 描述
  month: string                // YYYY-MM
  createdAt: number
}
```

存储 key: `dorm_savings_records`

---

## 3. 前端设计

### 3.1 新增组件

#### 3.1.1 BudgetWarning.vue - 预算警告条

```
┌──────────────────────────────────────────────┐
│ ⚠️ 本月预算即将耗尽 (已用 ¥1,230 / ¥1,500)  │  ← 黄色 (≥80%)
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ 🚫 本月预算已超支！ (已用 ¥1,620 / ¥1,500)  │  ← 红色 (>100%)
└──────────────────────────────────────────────┘
```

**Props:**
- `spent: number` - 已消费金额
- `budget: number` - 预算上限
- `threshold: number` - 预警阈值

**Events:**
- `exceeded` - 超支时触发（用于弹窗）

#### 3.1.2 BudgetProgress.vue - 预算进度条

```
本月预算    ¥1,230 / ¥1,500
┌──────────────────────────────┐
│ ████████████████░░░░░░░░░░░  │  82%
└──────────────────────────────┘
```

**Props:**
- `spent: number`
- `budget: number`
- `showLabel: boolean`

#### 3.1.3 SavingTipsCard.vue - 省钱小助手卡片

```
┌──────────────────────────────────┐
│ 🤖 省钱小助手                     │
│                                   │
│ 🍔 外卖频次过高                   │
│ 本月外卖 12 次，建议尝试食堂      │
│ 预计可省: ¥200-400               │
│ 👍 有用  👎 无用                  │
│                                   │
│ 🧋 奶茶支出占比大                 │
│ 奶茶占比 23%，建议减少频次        │
│ 预计可省: ¥100-200               │
│ 👍 有用  👎 无用                  │
└──────────────────────────────────┘
```

**Props:**
- `bills: Bill[]` - 账单数据
- `roommates: Roommate[]`

#### 3.1.4 SmartSavingCard.vue - 智能攒钱小助手卡片 [新增·核心]

```
┌──────────────────────────────────────────┐
│ 🐷 智能攒钱小助手                         │
│                                           │
│ 🎯 目标：买电脑  ¥1,200 / ¥3,000         │
│ ┌──────────────────────────────────────┐ │
│ │ ████████████░░░░░░░░░░░░░░░░░░░░░░  │ │
│ └──────────────────────────────────────┘ │
│ 进度 40%    剩余 ¥1,800    截止 2026-12-31│
│                                           │
│ ── 联动消息 ──────────────────────────── │
│ 💰 本月结余 ¥230，已加入"买电脑"进度！    │
│ 🧋 这个月少喝了3杯奶茶，买电脑进度 +¥15！ │
│                                           │
│ ── AI 省钱建议 ──────────────────────── │
│ 🍔 外卖频次过高                           │
│ 本月外卖 12 次，建议尝试食堂              │
│ 预计可省 ¥200-400                         │
│ [采纳建议]  👍 有用  👎 无用              │
│                                           │
│ [手动存入]  [切换目标]                    │
└──────────────────────────────────────────┘
```

**Props:**
- `bills: Bill[]` - 账单数据
- `budgetStatus: BudgetStatusInfo` - 预算状态

**Events:**
- `goalCompleted` - 目标达成时触发
- `updated` - 储蓄数据更新时触发

**子组件：**
- 储蓄目标进度条
- 联动消息列表
- 省钱建议列表（复用 SavingTipsCard 逻辑）
- 手动存入弹窗
- 目标设定弹窗

### 3.2 页面修改

#### Home.vue（首页）修改

```
┌──────────────────────────────────────────┐
│  [BudgetWarning]  ← 新增：预算警告条     │
├──────────────────────────────────────────┤
│  📊 账单总览                              │
│  ┌────────┐ ┌────────┐ ┌────────┐       │
│  │总金额   │ │账单数   │ │公平度   │      │
│  └────────┘ └────────┘ └────────┘       │
│  [BudgetProgress]  ← 已有：预算进度条    │
├──────────────────────────────────────────┤
│  [SmartSavingCard]  ← 新增：智能攒钱小助手│
├──────────────────────────────────────────┤
│  [SavingTipsCard]  ← 已有：省钱小助手    │
├──────────────────────────────────────────┤
│  最近账单                                │
│  [BillCard] [BillCard] [BillCard] ...    │
└──────────────────────────────────────────┘
```

#### Settings.vue（设置页）修改

新增"预算管理"区块：
- 月度预算输入框
- 预警阈值滑块（默认 80%）
- 按类别预算设置（可折叠）
- 启用/禁用开关

新增"储蓄目标管理"区块：
- 当前活跃目标展示
- 创建新目标（名称、金额、截止日期）
- 目标列表（切换活跃、删除、查看进度）
- 储蓄历史记录查看

---

## 4. 后端逻辑设计

### 4.1 预算计算逻辑 (budgetApi.ts)

```typescript
// 获取本月已消费总额
function getMonthSpent(bills: Bill[], year: number, month: number): number

// 获取预算设置
function getBudgetSettings(): BudgetSettings

// 更新预算设置
function updateBudgetSettings(settings: BudgetSettings): void

// 获取预算状态
function getBudgetStatus(): {
  spent: number
  budget: number
  ratio: number           // spent / budget
  status: 'normal' | 'warning' | 'exceeded'
  remaining: number       // budget - spent
}

// 保存月度预算记录
function saveBudgetRecord(record: BudgetRecord): void
```

### 4.2 省钱建议引擎 (suggestionApi.ts)

```typescript
interface SavingTip {
  id: string
  icon: string           // emoji 图标
  title: string          // 问题标题
  description: string    // 具体建议
  estimatedSaving: string // 预计可省金额
  category: BillCategory
  severity: 'info' | 'warning' | 'danger'
}

// 规则引擎 - 硬编码规则
interface SavingRule {
  id: string
  condition: (bills: Bill[]) => boolean
  generate: (bills: Bill[]) => SavingTip
}

// 内置规则列表
const rules: SavingRule[] = [
  foodFrequencyRule,      // 外卖频次规则
  milkTeaRatioRule,       // 奶茶占比规则
  electricityRule,        // 电费偏高规则
  snackRule,              // 夜宵零食规则
  trendRule,              // 消费趋势规则
]

// 生成省钱建议
function generateSuggestions(bills: Bill[]): SavingTip[]

// 大模型接口（预留）
async function generateAISuggestions(bills: Bill[]): Promise<SavingTip[]>
// → 后期接入华为云 ModelArts 大模型
```

### 4.3 储蓄管理逻辑 (savingsApi.ts) [新增·核心]

```typescript
// 获取所有储蓄目标
function getSavingsGoals(): SavingsGoal[]

// 获取当前活跃目标
function getActiveGoal(): SavingsGoal | null

// 创建储蓄目标
function createGoal(goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'createdAt' | 'updatedAt'>): SavingsGoal

// 更新目标
function updateGoal(id: string, updates: Partial<SavingsGoal>): void

// 删除目标
function deleteGoal(id: string): void

// 手动存入
function deposit(goalId: string, amount: number, description?: string): SavingsRecord

// 计算本月预算结余并自动存入（核心联动）
function applyBudgetSurplus(bills: Bill[], budget: number, goalId: string): {
  surplus: number           // 结余金额
  record: SavingsRecord | null
  message: string           // 联动提示消息
}

// 采纳省钱建议，将预计可省金额存入（核心联动）
function adoptSuggestion(goalId: string, tip: SavingTip): {
  amount: number            // 实际存入金额（预计可省的 50%）
  record: SavingsRecord
  message: string           // 联动提示消息
}

// 检测特定类别消费减少并自动存入（核心联动）
function checkCategoryReduction(bills: Bill[], goalId: string): {
  reductions: Array<{
    category: BillCategory
    savedAmount: number
    message: string         // 如"少喝了3杯奶茶，进度+¥15"
  }>
}

// 获取储蓄历史记录
function getSavingsRecords(goalId?: string): SavingsRecord[]

// 检查目标是否达成
function checkGoalCompletion(goal: SavingsGoal): boolean
```

### 4.4 联动逻辑流程图

```
用户添加账单 → 计算本月消费
       │
       ├─ 消费 < 预算？
       │    └─ 是 → applyBudgetSurplus()
       │         → 结余自动存入活跃目标
       │         → 生成联动消息
       │
       ├─ 用户采纳省钱建议？
       │    └─ 是 → adoptSuggestion()
       │         → 预计可省 × 50% 存入目标
       │         → 生成联动消息
       │
       └─ 检测类别消费减少？
            └─ 是 → checkCategoryReduction()
                 → 差额按比例存入目标
                 → 生成联动消息
       │
       ▼
检查目标是否达成 → checkGoalCompletion()
       │
       └─ 达成 → 触发祝贺弹窗
```

### 4.3 规则引擎详细设计

| 规则 ID | 触发条件 | 建议标题 | 建议内容 | 预计可省 |
|---------|---------|---------|---------|---------|
| food-frequency | food 类账单 > 10 笔/月 | 🍔 外卖频次过高 | 本月外卖 {n} 次，建议尝试食堂，经济又健康 | ¥200-400 |
| milk-tea-ratio | 奶茶/饮品金额占比 > 20% | 🧋 奶茶支出占比大 | 奶茶占比 {ratio}%，建议减少频次或自制饮品 | ¥100-200 |
| electricity-high | 电费 > 近 3 月平均 × 1.5 | ⚡ 电费偏高 | 本月电费 ¥{amount}，建议检查电器使用习惯 | ¥50-100 |
| snack-frequency | 夜宵/零食 > 5 笔/月 | 🍫 夜宵频次较高 | 夜宵 {n} 次，减少夜宵有益健康又省钱 | ¥100-300 |
| trend-rising | 总消费连续 3 月上升 | 📈 消费呈上升趋势 | 近 3 月消费持续上升，建议制定月度消费计划 | - |

---

## 5. 文件变更清单

### 5.1 新增文件

| 文件路径 | 说明 |
|---------|------|
| `src/types/budget.ts` | 预算相关类型定义 |
| `src/types/suggestion.ts` | 省钱建议类型定义 |
| `src/types/savings.ts` | 储蓄目标类型定义 |
| `src/api/budgetApi.ts` | 预算管理 API |
| `src/api/suggestionApi.ts` | 省钱建议引擎 |
| `src/api/savingsApi.ts` | 储蓄管理 + 联动逻辑 API |
| `src/components/BudgetWarning.vue` | 预算警告条组件 |
| `src/components/BudgetProgress.vue` | 预算进度条组件 |
| `src/components/SavingTipsCard.vue` | 省钱小助手卡片组件 |
| `src/components/SmartSavingCard.vue` | 智能攒钱小助手卡片（核心） |

### 5.2 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `src/views/Home.vue` | 添加预算警告条、进度条、省钱卡片、智能攒钱卡片 |
| `src/views/Settings.vue` | 添加预算管理 + 储蓄目标管理区块 |
| `src/utils/storage.ts` | 添加预算、储蓄数据存取函数 |