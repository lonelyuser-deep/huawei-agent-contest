export type BillCategory = 'electricity' | 'water' | 'food' | 'goods' | 'other'

export interface Bill {
  id: string
  title: string
  amount: number
  category: BillCategory
  paidBy: string
  date: string
  note?: string
  splitType: 'average' | 'custom' | 'ratio'
  splits?: SplitDetail[]
  createdAt: number
}

export interface SplitDetail {
  roommateId: string
  amount: number
  paid: boolean
}

export const CATEGORY_LABELS: Record<BillCategory, string> = {
  electricity: '电费',
  water: '水费',
  food: '餐饮',
  goods: '公共物品',
  other: '其他'
}

export const CATEGORY_ICONS: Record<BillCategory, string> = {
  electricity: '⚡',
  water: '💧',
  food: '🍔',
  goods: '📦',
  other: '📝'
}