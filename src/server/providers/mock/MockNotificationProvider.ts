import type { INotificationProvider, ProviderMetadata, NotificationResult } from "../types.ts";
import { logger } from "../../logger.ts";

export class MockNotificationProvider implements INotificationProvider {
  readonly metadata: ProviderMetadata = {
    providerName: "MOCK_NOTIFICATION_PROVIDER",
    isMock: true,
    version: "1.0.0"
  };

  async sendToUser(userId: string, title: string, body: string, data?: Record<string, string>): Promise<NotificationResult> {
    const notificationId = `sim_notif_${Date.now()}`;
    logger.info("MockNotificationProvider: Simulated user push dispatch", {
      userId,
      title,
      notificationId
    });

    return {
      success: true,
      notificationId,
      deliveredCount: 1,
      failureCount: 0
    };
  }

  async broadcastToTopic(topic: string, title: string, body: string, data?: Record<string, string>): Promise<NotificationResult> {
    const notificationId = `sim_bcast_${Date.now()}`;
    logger.info("MockNotificationProvider: Simulated topic broadcast", {
      topic,
      title,
      notificationId
    });

    return {
      success: true,
      notificationId,
      deliveredCount: 100, // Simulated subscribers
      failureCount: 0
    };
  }
}
