import { getStats } from './storage'

let reminderTimer: number | null = null

export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return Promise.resolve(false)
  if (Notification.permission === 'granted') return Promise.resolve(true)
  return Notification.requestPermission().then(p => p === 'granted')
}

export function startReminder(intervalMinutes: number = 60): void {
  stopReminder()
  checkAndNotify()
  reminderTimer = window.setInterval(() => {
    checkAndNotify()
  }, intervalMinutes * 60 * 1000)
}

function checkAndNotify(): void {
  const stats = getStats()
  if (stats.pending > 0) {
    showNotification('快递取件提醒', `您还有 ${stats.pending} 个快递未取，别忘了哦！`)
  }
}

export function stopReminder(): void {
  if (reminderTimer) {
    clearInterval(reminderTimer)
    reminderTimer = null
  }
}

export function showNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}

export function isReminderRunning(): boolean {
  return reminderTimer !== null
}

export function getPermissionStatus(): string {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}