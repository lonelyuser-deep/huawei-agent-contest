# 宿舍账单管家 - 技术设计文档 (TDD)

> 版本: 1.1.0  
> 更新日期: 2026-10-10  
> 变更: 新增预算预警和省钱建议功能的技术设计

---

## 1. 系统架构

```
┌─────────────────────────────────────────────────┐
│                   前端 (Vue3 + TS)               │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ 账单管理  │ │ 预算预警  │ │  省钱建议卡片    │ │
│  │ (已有)    │ │ (新增)   │ │  (新增)         │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│        │            │              │              │
│  ┌─────┴────────────┴──────────────┴──────────┐  │
│  │          Composables / Stores              │  │
│  │  useBudget()  useSuggestions()  useBills()  │  │
│  └────────────────────────────────────────────┘  │
│        │            │              │              │
│  ┌─────┴────────────┴──────────────┴──────────┐  │
│  │              API Service Layer              │  │
│  │  budgetApi   suggestionApi   ocrApi  nlpApi │  │
│  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────┐
│              数据层 (localStorage / 后端)        │
│  bills  roommates  budget_settings  suggestions  │
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
│  [BudgetProgress]  ← 新增：预算进度条    │
├──────────────────────────────────────────┤
│  [SavingTipsCard]  ← 新增：省钱小助手    │
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
| `src/api/budgetApi.ts` | 预算管理 API |
| `src/api/suggestionApi.ts` | 省钱建议引擎 |
| `src/components/BudgetWarning.vue` | 预算警告条组件 |
| `src/components/BudgetProgress.vue` | 预算进度条组件 |
| `src/components/SavingTipsCard.vue` | 省钱小助手卡片组件 |

### 5.2 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `src/views/Home.vue` | 添加预算警告条、进度条、省钱卡片 |
| `src/views/Settings.vue` | 添加预算管理设置区块 |
| `src/utils/storage.ts` | 添加预算数据存取函数 |