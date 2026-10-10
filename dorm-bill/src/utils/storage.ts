import type { Bill, BillCategory } from './bill'
import type { Roommate, FairnessScore } from './roommate'

const STORAGE_KEY_BILLS = 'dorm_bills'
const STORAGE_KEY_ROOMMATES = 'dorm_roommates'

export function loadBills(): Bill[] {
  const data = localStorage.getItem(STORAGE_KEY_BILLS)
  return data ? JSON.parse(data) : []
}

export function saveBills(bills: Bill[]): void {
  localStorage.setItem(STORAGE_KEY_BILLS, JSON.stringify(bills))
}

export function loadRoommates(): Roommate[] {
  const data = localStorage.getItem(STORAGE_KEY_ROOMMATES)
  if (data) return JSON.parse(data)
  const defaults: Roommate[] = [
    { id: 'r1', name: '室友A', joinedAt: Date.now() },
    { id: 'r2', name: '室友B', joinedAt: Date.now() },
    { id: 'r3', name: '室友C', joinedAt: Date.now() },
    { id: 'r4', name: '室友D', joinedAt: Date.now() }
  ]
  saveRoommates(defaults)
  return defaults
}

export function saveRoommates(roommates: Roommate[]): void {
  localStorage.setItem(STORAGE_KEY_ROOMMATES, JSON.stringify(roommates))
}

export function calculateSplits(bill: Bill, roommates: Roommate[]): SplitDetail[] {
  const activeRoommates = roommates.filter(r => r.joinedAt <= bill.createdAt || true)
  if (bill.splitType === 'average') {
    const perPerson = bill.amount / activeRoommates.length
    return activeRoommates.map(r => ({
      roommateId: r.id,
      amount: Math.round(perPerson * 100) / 100,
      paid: r.id === bill.paidBy
    }))
  }
  return bill.splits || []
}

export function calculateFairness(bills: Bill[], roommates: Roommate[]): FairnessScore[] {
  const scores: FairnessScore[] = roommates.map(r => ({
    roommateId: r.id,
    name: r.name,
    totalPaid: 0,
    totalShare: 0,
    balance: 0,
    fairness: 100
  }))

  for (const bill of bills) {
    const splits = bill.splits && bill.splits.length > 0
      ? bill.splits
      : calculateSplits(bill, roommates)
    for (const split of splits) {
      const score = scores.find(s => s.roommateId === split.roommateId)
      if (!score) continue
      score.totalShare += split.amount
      if (bill.paidBy === split.roommateId) {
        score.totalPaid += bill.amount
      }
    }
  }

  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0)
  for (const score of scores) {
    score.balance = Math.round((score.totalPaid - score.totalShare) * 100) / 100
    if (totalAmount > 0) {
      score.fairness = Math.max(0, Math.min(100,
        Math.round(100 - Math.abs(score.balance) / totalAmount * 200)
      ))
    }
  }

  return scores
}

export function recommendSplitPlan(bills: Bill[], roommates: Roommate[]): string[] {
  const scores = calculateFairness(bills, roommates)
  const sorted = [...scores].sort((a, b) => a.balance - b.balance)
  const suggestions: string[] = []

  for (const s of sorted) {
    if (s.balance < -0.01) {
      const debtors = sorted.filter(x => x.balance > 0.01).sort((a, b) => b.balance - a.balance)
      let remaining = Math.abs(s.balance)
      for (const d of debtors) {
        if (remaining <= 0.01) break
        const transfer = Math.min(remaining, d.balance)
        suggestions.push(`${s.name} → ${d.name}: ¥${Math.round(transfer * 100) / 100}`)
        remaining -= transfer
      }
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('🎉 账单已平衡，无需转账！')
  }

  return suggestions
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatAmount(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

export function formatDate(date: string): string {
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}