import type { BillCategory } from './bill'

export interface SavingTip {
  id: string
  icon: string
  title: string
  description: string
  estimatedSaving: string
  category: BillCategory | 'general'
  severity: 'info' | 'warning' | 'danger'
}

export interface SavingRule {
  id: string
  condition: (bills: import('./bill').Bill[]) => boolean
  generate: (bills: import('./bill').Bill[]) => SavingTip
}

export interface SuggestionFeedback {
  suggestionId: string
  useful: boolean
  createdAt: number
}