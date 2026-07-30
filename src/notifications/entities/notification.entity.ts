import { Notification } from "@prisma/client";

export class NotificationEntity {
  id: string;
  userId: string;
  taskId: string | null;
  type: string;
  scheduledAt: Date;
  sentAt: Date | null;
  status: string;
  payload: Record<string, unknown> | null;
  createdAt: Date;

  static fromNotification(notification: Notification): NotificationEntity {
    return {
      id: notification.id,
      userId: notification.userId,
      taskId: notification.taskId,
      type: notification.type,
      scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt,
      status: notification.status,
      payload: notification.payload as Record<string, unknown> | null,
      createdAt: notification.createdAt,
    };
  }
}
