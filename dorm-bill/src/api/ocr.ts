import type { BillCategory } from '@/types/bill'

interface OcrResult {
  amount: number
  category: BillCategory
  details: string
  date?: string
}

const CATEGORY_KEYWORDS: Record<string, BillCategory> = {
  '电费': 'electricity', '用电': 'electricity', '电量': 'electricity', 'kWh': 'electricity',
  '水费': 'water', '用水': 'water', '水量': 'water', '吨': 'water',
  '外卖': 'food', '订单': 'food', '餐': 'food', '食': 'food',
  '纸巾': 'goods', '洗衣': 'goods', '垃圾': 'goods', '扫把': 'goods'
}

export async function recognizeImage(file: File): Promise<OcrResult> {
  const base64 = await fileToBase64(file)
  const response = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 })
  })

  if (response.ok) {
    const data = await response.json()
    return parseOcrResponse(data)
  }

  return mockOcrResult(file.name)
}

function parseOcrResponse(data: any): OcrResult {
  const text = data.text || ''
  const amountMatch = text.match(/(?:金额|总计|合计|实付|￥|¥)\s*([\d.]+)/)
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0

  let category: BillCategory = 'other'
  for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (text.includes(keyword)) { category = cat; break }
  }

  const dateMatch = text.match(/(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})/)
  const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}` : undefined

  return { amount, category, details: text, date }
}

function mockOcrResult(filename: string): OcrResult {
  const lower = filename.toLowerCase()
  let category: BillCategory = 'other'
  for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (filename.includes(keyword)) { category = cat; break }
  }
  const amount = Math.round((Math.random() * 100 + 10) * 100) / 100
  return {
    amount,
    category,
    details: `[模拟识别] 文件: ${filename}\n识别金额: ¥${amount}\n类别: ${category}\n\n注: 当前为模拟模式，配置华为云OCR后可获取真实识别结果`
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}