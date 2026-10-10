import type { BillCategory } from '@/types/bill'

interface NlpResult {
  success: boolean
  amount: number
  category: BillCategory
  paidByName?: string
  description: string
  involvedNames: string[]
}

const AMOUNT_PATTERN = /(\d+(?:\.\d+)?)\s*[元块]/
const NAME_PATTERN = /(?:帮|给|为|跟|和|与)\s*([\u4e00-\u9fa5]{1,4})/

const CATEGORY_HINTS: Record<string, BillCategory> = {
  '电费': 'electricity', '电': 'electricity',
  '水费': 'water', '水': 'water',
  '外卖': 'food', '饭': 'food', '餐': 'food', '奶茶': 'food', '面': 'food', '吃': 'food',
  '纸巾': 'goods', '洗衣液': 'goods', '垃圾袋': 'goods', '扫把': 'goods', '买': 'goods'
}

export function parseNaturalLanguage(input: string, roommateNames: string[]): NlpResult {
  const amountMatch = input.match(AMOUNT_PATTERN)
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0

  let paidByName: string | undefined
  const nameMatch = input.match(NAME_PATTERN)
  if (nameMatch) {
    paidByName = nameMatch[1]
  }
  for (const name of roommateNames) {
    if (input.includes(name)) {
      if (!paidByName) paidByName = name
    }
  }

  let category: BillCategory = 'other'
  for (const [hint, cat] of Object.entries(CATEGORY_HINTS)) {
    if (input.includes(hint)) { category = cat; break }
  }

  const involvedNames = roommateNames.filter(name => input.includes(name))
  if (paidByName && !involvedNames.includes(paidByName)) {
    involvedNames.unshift(paidByName)
  }

  return {
    success: amount > 0,
    amount,
    category,
    paidByName,
    description: input,
    involvedNames
  }
}

export async function parseWithCloudNlp(input: string): Promise<NlpResult> {
  const response = await fetch('/api/nlp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: input })
  })

  if (response.ok) {
    return await response.json()
  }

  return {
    success: false,
    amount: 0,
    category: 'other',
    description: 'NLP服务暂不可用，请使用本地解析'
  }
}