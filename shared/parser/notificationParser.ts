import { ExpressData, createExpress } from '../types/express'

const COURIERS = ['顺丰', '圆通速递', '圆通', '中通快递', '中通', '申通快递', '申通',
  '韵达快递', '韵达', '百世快递', '百世', '邮政EMS', 'EMS', '中国邮政', '邮政',
  '京东快递', '京东', '德邦快递', '德邦', '极兔速递', '极兔']

const STATIONS = ['菜鸟驿站', '菜鸟', '丰巢快递柜', '丰巢', '智能快递柜', '快递柜',
  '驿站', '京东快递柜', '中国邮政', '邮局']

export function parseNotification(text: string): ExpressData | null {
  if (!text || !text.trim()) return null

  let remaining = text.trim()
  const station = extractFirst(remaining, STATIONS)
  if (station) remaining = remaining.replace(station, ' ')
  const normalizedStation = station === '菜鸟' ? '菜鸟驿站' : station

  const courier = extractFirst(remaining, COURIERS)
  if (courier) remaining = remaining.replace(courier, ' ')

  const code = extractCode(remaining)
  if (code) remaining = remaining.replace(code, ' ')

  const phone = extractPhone(remaining, code)

  if (!code && !normalizedStation) return null

  return createExpress(normalizedStation || '', code || '', courier || '', phone || '')
}

function extractFirst(text: string, keywords: string[]): string {
  for (const kw of keywords) {
    if (text.includes(kw)) return kw
  }
  return ''
}

function extractCode(text: string): string {
  const patterns = [
    /取件码[:：\s]*([A-Za-z0-9\-]+)/i,
    /取货码[:：\s]*([A-Za-z0-9\-]+)/i,
    /(\d+-\d+-\d+)/,
    /([A-Z]\d{1,3})/,
    /(\d+-\d+)/,
    /(\d{6,})/
  ]
  for (const p of patterns) {
    const match = text.match(p)
    if (match) return match[1] || match[0]
  }
  return ''
}

function extractPhone(text: string, excludeCode: string): string {
  const match = text.match(/尾号[:：\s]*(\d{4})/)
  if (match) return match[1]
  const phoneMatch = text.match(/(\d{4})/)
  if (phoneMatch && phoneMatch[1] !== excludeCode) return phoneMatch[1]
  return ''
}