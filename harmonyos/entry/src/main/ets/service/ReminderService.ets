import reminderAgent from '@ohos.reminderAgent';
import { ExpressData } from '../model/ExpressData';

export class ReminderService {
  async setPickupReminder(express: ExpressData, delayMinutes: number = 60): Promise<number> {
    const reminder: reminderAgent.ReminderRequestTimer = {
      reminderType: reminderAgent.ReminderType.REMINDER_TYPE_TIMER,
      title: '快递取件提醒',
      content: `您有快递待取：${express.station || '驿站'} 取件码 ${express.code}`,
      timeSecond: delayMinutes * 60,
      notificationId: this.hashId(express.id)
    };
    return await reminderAgent.publishReminder(reminder);
  }

  async setDailyReminder(pendingCount: number, hour: number = 10): Promise<number> {
    if (pendingCount === 0) return -1;
    const reminder: reminderAgent.ReminderRequestCalendar = {
      reminderType: reminderAgent.ReminderType.REMINDER_TYPE_CALENDAR,
      title: '快递提醒',
      content: `您还有 ${pendingCount} 个快递未取，别忘了哦！`,
      dateTime: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: hour,
        minute: 0
      }
    };
    return await reminderAgent.publishReminder(reminder);
  }

  async cancelReminder(reminderId: number): Promise<void> {
    await reminderAgent.cancelReminder(reminderId);
  }

  async cancelAllReminders(): Promise<void> {
    await reminderAgent.cancelAllReminders();
  }

  private hashId(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length && i < 8; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) & 0x7FFFFFFF;
    }
    return hash;
  }
}

export const reminderService = new ReminderService();