const COURIERS = ['顺丰', '圆通速递', '圆通', '中通快递', '中通', '申通快递', '申通',
  '韵达快递', '韵达', '百世快递', '百世', '邮政EMS', 'EMS', '中国邮政', '邮政',
  '京东快递', '京东', '德邦快递', '德邦', '极兔速递', '极兔', '天天快递', '天天']

const STATIONS = ['菜鸟驿站', '菜鸟', '丰巢快递柜', '丰巢', '智能快递柜', '快递柜',
  '驿站', '京东快递柜', '中国邮政', '邮局', '顺丰营业点', '圆通营业点']

function parseInput(text) {
  if (!text || !text.trim()) return null

  let remaining = text.trim()
  const result = { station: '', code: '', courier: '', phone: '' }

  for (const c of COURIERS) {
    if (remaining.includes(c)) {
      result.courier = c
      remaining = remaining.replace(c, ' ')
      break
    }
  }

  for (const s of STATIONS) {
    if (remaining.includes(s)) {
      result.station = s === '菜鸟' ? '菜鸟驿站' : s
      remaining = remaining.replace(s, ' ')
      break
    }
  }

  const codePatterns = [
    /取件码[:：\s]*([A-Za-z0-9\-]+)/i,
    /(\d+-\d+-\d+)/,
    /([A-Z]\d{1,3})/,
    /(\d+-\d+)/,
    /(\d{6,})/,
    /(\d{4})/
  ]
  for (const p of codePatterns) {
    const match = remaining.match(p)
    if (match) {
      result.code = match[1] || match[0]
      remaining = remaining.replace(result.code, ' ')
      break
    }
  }

  const phoneMatch = remaining.match(/尾号[:：\s]*(\d{4})/) || remaining.match(/(\d{4})/)
  if (phoneMatch && phoneMatch[1] !== result.code) {
    result.phone = phoneMatch[1]
  }

  return result
}

module.exports = { parseInput, COURIERS, STATIONS }