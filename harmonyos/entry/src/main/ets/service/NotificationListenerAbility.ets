import NotificationListenerAbility from '@ohos.application.NotificationListenerAbility';
import notification from '@ohos.notification';
import { parseNotification } from '../utils/NotificationParser';
import { expressStorage } from '../utils/ExpressStorage';

export default class ExpressNotificationListener extends NotificationListenerAbility {
  onConnect() {
    console.info('ExpressNotificationListener connected');
  }

  onDisconnect() {
    console.info('ExpressNotificationListener disconnected');
  }

  onNotificationPosted(notificationId: string, request: notification.NotificationRequest) {
    console.info('Notification received: ' + notificationId);
    this.processNotification(request);
  }

  onNotificationRemoved(notificationId: string) {
    console.info('Notification removed: ' + notificationId);
  }

  private async processNotification(request: notification.NotificationRequest) {
    try {
      const content = request.content;
      if (!content) return;

      let text = '';
      const basicContent = content as notification.NotificationBasicContent;
      if (basicContent?.title) text += basicContent.title + ' ';
      if (basicContent?.additionalText) text += basicContent.additionalText + ' ';
      if (basicContent?.text) text += basicContent.text;

      if (!text.trim()) return;

      const result = parseNotification(text);
      if (result && result.code) {
        await expressStorage.addRecord(result);
        console.info('Auto imported: station=' + result.station + ' code=' + result.code);
      }
    } catch (e) {
      console.error('Notification parse error: ' + JSON.stringify(e));
    }
  }
}