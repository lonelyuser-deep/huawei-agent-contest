export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface Course {
  id: string
  name: string
  teacher: string
  location: string
  weekday: Weekday
  startSection: number
  endSection: number
  weeks: string
  color?: string
}

export interface ScheduleData {
  courses: Course[]
  updatedAt: number
  semester: string
}

export const SECTION_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '08:00', end: '08:45' },
  2: { start: '08:55', end: '09:40' },
  3: { start: '10:00', end: '10:45' },
  4: { start: '10:55', end: '11:40' },
  5: { start: '14:00', end: '14:45' },
  6: { start: '14:55', end: '15:40' },
  7: { start: '16:00', end: '16:45' },
  8: { start: '16:55', end: '17:40' },
  9: { start: '19:00', end: '19:45' },
  10: { start: '19:55', end: '20:40' },
  11: { start: '20:50', end: '21:35' },
  12: { start: '21:45', end: '22:30' }
}

export const WEEKDAY_NAMES: Record<Weekday, string> = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日'
}

export const COURSE_COLORS = [
  '#1D7561', '#2A9D7E', '#3B82A4', '#B5744C',
  '#8B5A9F', '#C76B6B', '#5B8C5A', '#7A6CA8',
  '#D49B5A', '#4C9C8B', '#9C6B9C', '#6B8DB5'
]

export function createCourse(
  name: string,
  weekday: Weekday,
  startSection: number,
  endSection: number,
  location: string = '',
  teacher: string = '',
  weeks: string = '1-16周'
): Course {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
    name,
    teacher,
    location,
    weekday,
    startSection,
    endSection,
    weeks,
    color: COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)]
  }
}

export function getTodayWeekday(): Weekday {
  const day = new Date().getDay()
  return (day === 0 ? 7 : day) as Weekday
}

export function getSectionTime(section: number): { start: string; end: string } {
  return SECTION_TIMES[section] || { start: '--:--', end: '--:--' }
}

export function parseSectionTimeToMinutes(section: number, isStart: boolean): number {
  const time = getSectionTime(section)
  const str = isStart ? time.start : time.end
  const [h, m] = str.split(':').map(Number)
  return h * 60 + m
}