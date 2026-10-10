import type { Bill, BillCategory } from '@/types/bill'
import type { SavingTip, SavingRule, SuggestionFeedback } from '@/types/suggestion'
import { generateId } from '@/utils/storage'

const STORAGE_KEY_FEEDBACK = 'dorm_suggestion_feedback'

function countByCategory(bills: Bill[], category: BillCategory): number {
  return bills.filter(b => b.category === category).length
}

function sumByCategory(bills: Bill[], category: BillCategory): number {
  return bills.filter(b => b.category === category).reduce((s, b) => s + b.amount, 0)
}

function isCurrentMonth(bill: Bill): boolean {
  const d = new Date(bill.date)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

const foodFrequencyRule: SavingRule = {
  id: 'food-frequency',
  condition: (bills) => {
    const monthBills = bills.filter(isCurrentMonth)
    return countByCategory(monthBills, 'food') > 10
  },
  generate: (bills) => {
    const monthBills = bills.filter(isCurrentMonth)
    const count = countByCategory(monthBills, 'food')
    return {
      id: generateId(),
      icon: '🍔',
      title: '外卖频次过高',
      description: `本月外卖 ${count} 次，建议尝试食堂，经济又健康`,
      estimatedSaving: '¥200-400',
      category: 'food',
      severity: 'warning'
    }
  }
}

const milkTeaRatioRule: SavingRule = {
  id: 'milk-tea-ratio',
  condition: (bills) => {
    const monthBills = bills.filter(isCurrentMonth)
    const foodTotal = sumByCategory(monthBills, 'food')
    const total = monthBills.reduce((s, b) => s + b.amount, 0)
    return total > 0 && foodTotal / total > 0.2 && countByCategory(monthBills, 'food') > 3
  },
  generate: (bills) => {
    const monthBills = bills.filter(isCurrentMonth)
    const foodTotal = sumByCategory(monthBills, 'food')
    const total = monthBills.reduce((s, b) => s + b.amount, 0)
    const ratio = Math.round((foodTotal / total) * 100)
    return {
      id: generateId(),
      icon: '🧋',
      title: '餐饮支出占比大',
      description: `餐饮占比 ${ratio}%，建议减少外卖频次或尝试自己做饭`,
      estimatedSaving: '¥100-200',
      category: 'food',
      severity: 'info'
    }
  }
}

const electricityHighRule: SavingRule = {
  id: 'electricity-high',
  condition: (bills) => {
    const monthBills = bills.filter(isCurrentMonth)
    const currentElec = sumByCategory(monthBills, 'electricity')
    if (currentElec === 0) return false
    const now = new Date()
    const history: number[] = []
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const histBills = bills.filter(b => {
        const bd = new Date(b.date)
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth()
      })
      history.push(sumByCategory(histBills, 'electricity'))
    }
    const avg = history.filter(h => h > 0).reduce((s, h) => s + h, 0) / Math.max(1, history.filter(h => h > 0).length)
    return avg > 0 && currentElec > avg * 1.5
  },
  generate: (bills) => {
    const monthBills = bills.filter(isCurrentMonth)
    const amount = sumByCategory(monthBills, 'electricity')
    return {
      id: generateId(),
      icon: '⚡',
      title: '电费偏高',
      description: `本月电费 ¥${amount.toFixed(2)}，建议检查电器使用习惯，及时关闭待机设备`,
      estimatedSaving: '¥50-100',
      category: 'electricity',
      severity: 'warning'
    }
  }
}

const snackRule: SavingRule = {
  id: 'snack-frequency',
  condition: (bills) => {
    const monthBills = bills.filter(isCurrentMonth)
    return monthBills.filter(b => b.title.includes('夜宵') || b.title.includes('零食') || b.title.includes('薯片')).length > 5
  },
  generate: (bills) => {
    const monthBills = bills.filter(isCurrentMonth)
    const count = monthBills.filter(b => b.title.includes('夜宵') || b.title.includes('零食') || b.title.includes('薯片')).length
    return {
      id: generateId(),
      icon: '🍫',
      title: '夜宵零食频次较高',
      description: `本月夜宵/零食 ${count} 次，减少夜宵有益健康又省钱`,
      estimatedSaving: '¥100-300',
      category: 'food',
      severity: 'info'
    }
  }
}

const trendRisingRule: SavingRule = {
  id: 'trend-rising',
  condition: (bills) => {
    const now = new Date()
    const totals: number[] = []
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthBills = bills.filter(b => {
        const bd = new Date(b.date)
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth()
      })
      totals.push(monthBills.reduce((s, b) => s + b.amount, 0))
    }
    return totals[2] > 0 && totals[1] > totals[2] && totals[0] > totals[1]
  },
  generate: () => ({
    id: generateId(),
    icon: '📈',
    title: '消费呈上升趋势',
    description: '近 3 个月消费持续上升，建议制定月度消费计划，控制非必要支出',
    estimatedSaving: '视情况而定',
    category: 'general',
    severity: 'danger'
  })
}

const rules: SavingRule[] = [
  foodFrequencyRule,
  milkTeaRatioRule,
  electricityHighRule,
  snackRule,
  trendRisingRule
]

export function generateSuggestions(bills: Bill[]): SavingTip[] {
  return rules
    .filter(rule => rule.condition(bills))
    .map(rule => rule.generate(bills))
}

export async function generateAISuggestions(bills: Bill[]): Promise<SavingTip[]> {
  const response = await fetch('/api/ai-suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bills })
  })
  if (response.ok) return await response.json()
  return generateSuggestions(bills)
}

export function saveSuggestionFeedback(feedback: SuggestionFeedback): void {
  const data = localStorage.getItem(STORAGE_KEY_FEEDBACK)
  const list: SuggestionFeedback[] = data ? JSON.parse(data) : []
  list.push(feedback)
  localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(list))
}

export function loadSuggestionFeedback(): SuggestionFeedback[] {
  const data = localStorage.getItem(STORAGE_KEY_FEEDBACK)
  return data ? JSON.parse(data) : []
}