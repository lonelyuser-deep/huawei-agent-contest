import type { BillCategory } from './bill'

export interface BudgetSettings {
  monthlyBudget: number
  categoryBudgets: Partial<Record<BillCategory, number>>
  alertThreshold: number
  enabled: boolean
}

export interface BudgetRecord {
  id: string
  year: number
  month: number
  budget: number
  actualSpent: number
  status: BudgetStatus
  createdAt: number
}

export type BudgetStatus = 'normal' | 'warning' | 'exceeded'

export interface BudgetStatusInfo {
  spent: number
  budget: number
  ratio: number
  status: BudgetStatus
  remaining: number
  threshold: number
}

export const DEFAULT_BUDGET_SETTINGS: BudgetSettings = {
  monthlyBudget: 1500,
  categoryBudgets: {},
  alertThreshold: 80,
  enabled: true
}