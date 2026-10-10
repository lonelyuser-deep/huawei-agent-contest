import type { Course } from '@shared/types/schedule'
import { getTodayWeekday, getSectionTime } from '@shared/types/schedule'
import { getCoursesByWeekday } from './scheduleStorage'

let reminderTimer: number | null = null
let notifiedKeys: Set<string> = new Set()

export interface ScheduleReminderConfig {
  enabled: boolean
  advanceMinutes: number
  checkIntervalMinutes: number
}

const CONFIG_KEY = 'schedule_reminder_config'

export function getDefaultConfig(): ScheduleReminderConfig {
  return { enabled: false, advanceMinutes: 15, checkIntervalMinutes: 5 }
}

export function getReminderConfig(): ScheduleReminderConfig {
  const data = localStorage.getItem(CONFIG_KEY)
  if (data) return { ...getDefaultConfig(), ...JSON.parse(data) }
  return getDefaultConfig()
}

export function saveReminderConfig(config: ScheduleReminderConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return Promise.resolve(false)
  if (Notification.permission === 'granted') return Promise.resolve(true)
  return Notification.requestPermission().then(p => p === 'granted')
}

export function getPermissionStatus(): string {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function showNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'schedule-reminder'
    })
  }
}

export function startScheduleReminder(config?: ScheduleReminderConfig): void {
  stopScheduleReminder()
  const cfg = config || getReminderConfig()
  if (!cfg.enabled) return

  checkAndNotify(cfg.advanceMinutes)
  reminderTimer = window.setInterval(() => {
    checkAndNotify(cfg.advanceMinutes)
  }, cfg.checkIntervalMinutes * 60 * 1000)
}

export function stopScheduleReminder(): void {
  if (reminderTimer) {
    clearInterval(reminderTimer)
    reminderTimer = null
  }
}

function checkAndNotify(advanceMinutes: number): void {
  const today = getTodayWeekday()
  const courses = getCoursesByWeekday(today)
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  for (const course of courses) {
    const sectionTime = getSectionTime(course.startSection)
    const [h, m] = sectionTime.start.split(':').map(Number)
    const courseStartMinutes = h * 60 + m
    const notifyMinutes = courseStartMinutes - advanceMinutes
    const key = `${today}-${course.id}-${notifyMinutes}`

    if (nowMinutes >= notifyMinutes && nowMinutes <= courseStartMinutes && !notifiedKeys.has(key)) {
      notifiedKeys.add(key)
      const timeStr = sectionTime.start
      const locationStr = course.location ? `，教室：${course.location}` : ''
      const teacherStr = course.teacher ? `，教师：${course.teacher}` : ''
      showNotification(
        `上课提醒 · ${course.name}`,
        `${timeStr} 即将上课${locationStr}${teacherStr}`
      )
    }
  }

  if (notifiedKeys.size > 100) {
    notifiedKeys = new Set(Array.from(notifiedKeys).slice(-50))
  }
}

export function isReminderRunning(): boolean {
  return reminderTimer !== null
}

export function getUpcomingCourses(minutesAhead: number = 120): Course[] {
  const today = getTodayWeekday()
  const courses = getCoursesByWeekday(today)
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return courses.filter(course => {
    const sectionTime = getSectionTime(course.startSection)
    const [h, m] = sectionTime.start.split(':').map(Number)
    const courseStartMinutes = h * 60 + m
    return courseStartMinutes >= nowMinutes && courseStartMinutes <= nowMinutes + minutesAhead
  })
}

export function getNextCourse(): Course | null {
  const upcoming = getUpcomingCourses(720)
  return upcoming.length > 0 ? upcoming[0] : null
}

export function formatCourseReminder(course: Course): string {
  const time = getSectionTime(course.startSection)
  const parts = [`${time.start} ${course.name}`]
  if (course.location) parts.push(`教室 ${course.location}`)
  if (course.teacher) parts.push(course.teacher)
  return parts.join(' · ')
}