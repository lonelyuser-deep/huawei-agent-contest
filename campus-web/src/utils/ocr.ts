import type { Course, Weekday } from '@shared/types/schedule'
import { createCourse } from '@shared/types/schedule'

export interface OCRResult {
  text: string
  courses: Course[]
  confidence: number
}

export interface OCRProgress {
  status: string
  progress: number
}

type ProgressCallback = (progress: OCRProgress) => void

export async function recognizeScheduleImage(
  image: File | string,
  onProgress?: ProgressCallback
): Promise<OCRResult> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('chi_sim', 1, {
    logger: (m: any) => {
      if (onProgress && m.status && typeof m.progress === 'number') {
        onProgress({ status: m.status, progress: m.progress })
      }
    }
  })

  const result = await worker.recognize(image)
  await worker.terminate()

  const text = result.data.text
  const confidence = result.data.confidence
  const courses = parseScheduleText(text)

  return { text, courses, confidence }
}

export function parseScheduleText(text: string): Course[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const courses: Course[] = []
  const seenNames = new Set<string>()

  for (const line of lines) {
    const parsed = parseLine(line)
    if (parsed && parsed.name && !seenNames.has(parsed.name + parsed.weekday)) {
      seenNames.add(parsed.name + parsed.weekday)
      courses.push(parsed)
    }
  }

  return courses
}

function parseLine(line: string): Course | null {
  const weekday = detectWeekday(line)
  if (!weekday) return null

  const sections = detectSections(line)
  if (!sections) return null

  const name = detectCourseName(line)
  if (!name || name.length < 2) return null

  const location = detectLocation(line)
  const teacher = detectTeacher(line)
  const weeks = detectWeeks(line)

  return createCourse(name, weekday, sections.start, sections.end, location, teacher, weeks)
}

function detectWeekday(line: string): Weekday | null {
  const patterns: { regex: RegExp; day: Weekday }[] = [
    { regex: /星期[一1]|周[一1]/, day: 1 },
    { regex: /星期[二2]|周[二2]/, day: 2 },
    { regex: /星期[三3]|周[三3]/, day: 3 },
    { regex: /星期[四4]|周[四4]/, day: 4 },
    { regex: /星期[五5]|周[五5]/, day: 5 },
    { regex: /星期[六6]|周[六6]/, day: 6 },
    { regex: /星期[日天7]|周[日天7]/, day: 7 }
  ]
  for (const p of patterns) {
    if (p.regex.test(line)) return p.day
  }
  return null
}

function detectSections(line: string): { start: number; end: number } | null {
  const match = line.match(/第?\s*(\d+)\s*[-~至]\s*(\d+)\s*节?/)
  if (match) {
    const start = parseInt(match[1])
    const end = parseInt(match[2])
    if (start >= 1 && end <= 12 && start <= end) return { start, end }
  }
  const single = line.match(/第?\s*(\d+)\s*节/)
  if (single) {
    const s = parseInt(single[1])
    if (s >= 1 && s <= 12) return { start: s, end: s }
  }
  return null
}

function detectCourseName(line: string): string {
  const cleaned = line
    .replace(/星期[一二三四五六日天1-7]|周[一二三四五六日天1-7]/g, '')
    .replace(/第?\d+[-~至]\d+节?/g, '')
    .replace(/第?\d+节/g, '')
    .replace(/\d+-\d+周/g, '')
    .replace(/\d+周/g, '')
    .replace(/[\d\-\s]{4,}/g, ' ')
    .replace(/[（(].*?[)）]/g, '')
    .trim()

  const parts = cleaned.split(/\s{2,}|[,，;；|]/).filter(p => p.length >= 2)
  return parts[0] || cleaned
}

function detectLocation(line: string): string {
  const patterns = [
    /([A-Za-z]\d+[-\d]*室?)/,
    /(教\d+[-\d]*室?)/,
    /(学\d+[-\d]*室?)/,
    /(楼\d+[-\d]*室?)/,
    /([\u4e00-\u9fa5]{1,4}\d+室)/,
    /(教室\d+[-\d]*)/
  ]
  for (const p of patterns) {
    const match = line.match(p)
    if (match) return match[1]
  }
  return ''
}

function detectTeacher(line: string): string {
  const match = line.match(/[\u4e00-\u9fa5]{2,4}(?:老师|教授|讲师)/)
  if (match) return match[0]
  const parenMatch = line.match(/[（(]([\u4e00-\u9fa5]{2,4})[)）]/)
  if (parenMatch) return parenMatch[1]
  return ''
}

function detectWeeks(line: string): string {
  const match = line.match(/(\d+[-~至]\d+)周/)
  if (match) return match[1] + '周'
  return '1-16周'
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}