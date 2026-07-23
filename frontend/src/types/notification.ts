export type NotificationType = 'REMINDER' | 'DELEGATION' | 'WEEKLY_REVIEW' | 'SYSTEM';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface Notification {
  id: string;
  userId: string;
  taskId: string | null;
  type: NotificationType;
  scheduledAt: string;
  sentAt: string | null;
  status: NotificationStatus;
  payload: {
    title: string;
    body: string;
  };
  createdAt: string;
}
