import type { Bill } from '@/types/bill'
import type { BudgetSettings, BudgetRecord, BudgetStatusInfo, BudgetStatus } from '@/types/budget'
import { DEFAULT_BUDGET_SETTINGS } from '@/types/budget'
import { generateId } from './storage'

const STORAGE_KEY_BUDGET_SETTINGS = 'dorm_budget_settings'
const STORAGE_KEY_BUDGET_RECORDS = 'dorm_budget_records'

export function loadBudgetSettings(): BudgetSettings {
  const data = localStorage.getItem(STORAGE_KEY_BUDGET_SETTINGS)
  if (data) return { ...DEFAULT_BUDGET_SETTINGS, ...JSON.parse(data) }
  return { ...DEFAULT_BUDGET_SETTINGS }
}

export function saveBudgetSettings(settings: BudgetSettings): void {
  localStorage.setItem(STORAGE_KEY_BUDGET_SETTINGS, JSON.stringify(settings))
}

export function loadBudgetRecords(): BudgetRecord[] {
  const data = localStorage.getItem(STORAGE_KEY_BUDGET_RECORDS)
  return data ? JSON.parse(data) : []
}

export function saveBudgetRecord(record: BudgetRecord): void {
  const records = loadBudgetRecords()
  const idx = records.findIndex(r => r.year === record.year && r.month === record.month)
  if (idx >= 0) records[idx] = record
  else records.push(record)
  localStorage.setItem(STORAGE_KEY_BUDGET_RECORDS, JSON.stringify(records))
}

export function getMonthSpent(bills: Bill[], year: number, month: number): number {
  return bills
    .filter(b => {
      const d = new Date(b.date)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
    .reduce((sum, b) => sum + b.amount, 0)
}

export function getBudgetStatus(bills: Bill[]): BudgetStatusInfo {
  const settings = loadBudgetSettings()
  const now = new Date()
  const spent = getMonthSpent(bills, now.getFullYear(), now.getMonth() + 1)
  const budget = settings.monthlyBudget
  const ratio = budget > 0 ? spent / budget : 0
  const threshold = settings.alertThreshold / 100

  let status: BudgetStatus = 'normal'
  if (ratio >= 1) status = 'exceeded'
  else if (ratio >= threshold) status = 'warning'

  const result: BudgetStatusInfo = {
    spent: Math.round(spent * 100) / 100,
    budget,
    ratio: Math.round(ratio * 100) / 100,
    status,
    remaining: Math.round((budget - spent) * 100) / 100,
    threshold: settings.alertThreshold
  }

  saveBudgetRecord({
    id: generateId(),
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    budget,
    actualSpent: result.spent,
    status,
    createdAt: Date.now()
  })

  return result
}

export function getBudgetHistory(): BudgetRecord[] {
  return loadBudgetRecords().sort((a, b) => b.year - a.year || b.month - a.month)
}