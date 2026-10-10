export interface Roommate {
  id: string
  name: string
  avatar?: string
  joinedAt: number
}

export interface FairnessScore {
  roommateId: string
  name: string
  totalPaid: number
  totalShare: number
  balance: number
  fairness: number
}