export class NotificationService {
  static async sendNotification(
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ) {
    // 模擬通知服務
    console.log(`[${type.toUpperCase()}] ${message}`);
    return Promise.resolve();
  }

  static async sendPushNotification(userId: string, message: string) {
    // 模擬推送通知
    console.log(`Push notification to user ${userId}: ${message}`);
    return Promise.resolve();
  }

  static async sendEmailNotification(
    email: string,
    subject: string,
    message: string
  ) {
    // 模擬郵件通知
    console.log(`Email to ${email}: ${subject} - ${message}`);
    return Promise.resolve();
  }
}
