import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationEntity } from './entities/notification.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async findAll(userId: string, query: NotificationQueryDto): Promise<NotificationEntity[]> {
    const where: any = {
      userId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(NotificationEntity.fromNotification);
  }

  async markRead(userId: string, notificationId: string): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'SENT' },
    });

    return NotificationEntity.fromNotification(updatedNotification);
  }

  async cancel(userId: string, notificationId: string): Promise<{ message: string }> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        status: 'PENDING',
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found or already sent');
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Notification cancelled successfully' };
  }

  async scheduleNotification(
    userId: string,
    taskId: string | null,
    type: string,
    scheduledAt: Date,
    payload: Record<string, unknown>,
  ): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        taskId,
        type: type as any,
        scheduledAt,
        payload: payload as any,
        status: 'PENDING',
      },
    });

    if (this.notificationQueue) {
      await this.notificationQueue.add(
        'dispatch-notification',
        {
          notificationId: notification.id,
          userId,
          type,
          payload,
        },
        {
          delay: scheduledAt.getTime() - Date.now(),
        },
      );
    }

    return NotificationEntity.fromNotification(notification);
  }
}
