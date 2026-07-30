import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { Logger } from "@nestjs/common";

@Processor("notification")
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case "dispatch-notification":
        return this.handleDispatchNotification(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async handleDispatchNotification(job: Job) {
    this.logger.log(
      `Dispatching notification ${job.data.notificationId} for user ${job.data.userId}`,
    );

    try {
      const { notificationId, userId, payload } = job.data;

      const pushSubscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId },
      });

      for (const subscription of pushSubscriptions) {
        try {
          const webpush = require("web-push");
          webpush.setVapidDetails(
            "mailto:notifications@momen.app",
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY,
          );

          const pushPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            data: payload.data,
            icon: "/icons/icon-192x192.png",
            badge: "/icons/badge-72x72.png",
          });

          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys as { p256dh: string; auth: string },
            },
            pushPayload,
          );

          await this.prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { lastUsedAt: new Date() },
          });
        } catch (pushError: any) {
          this.logger.error(
            `Failed to send push notification to ${subscription.endpoint}: ${pushError.message}`,
          );

          if (pushError.statusCode === 410) {
            await this.prisma.pushSubscription.delete({
              where: { id: subscription.id },
            });
            this.logger.log(
              `Removed invalid push subscription ${subscription.id}`,
            );
          }
        }
      }

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });

      this.logger.log(`Notification ${notificationId} dispatched successfully`);
    } catch (error: any) {
      this.logger.error(
        `Failed to dispatch notification ${job.data.notificationId}: ${error.message}`,
      );

      await this.prisma.notification.update({
        where: { id: job.data.notificationId },
        data: { status: "FAILED" },
      });

      throw error;
    }
  }
}
