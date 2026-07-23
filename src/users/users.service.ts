import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateNotificationPrefsDto } from './dto/update-notification-prefs.dto';
import { UserEntity } from './entities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('export') private readonly exportQueue: Queue,
  ) {}

  async getProfile(userId: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserEntity.fromUser(user);
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });

    return UserEntity.fromUser(user);
  }

  async updateNotificationPrefs(
    userId: string,
    updateNotificationPrefsDto: UpdateNotificationPrefsDto,
  ): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingPrefs = (user.notificationPrefs as Record<string, unknown>) || {};
    const updatedPrefs = { ...existingPrefs, ...updateNotificationPrefsDto };

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: updatedPrefs },
    });

    return UserEntity.fromUser(updatedUser);
  }

  async requestDataExport(
    userId: string,
    format: 'json' | 'csv' = 'json',
  ): Promise<{ message: string; exportId: string }> {
    const exportId = `export_${userId}_${Date.now()}`;

    await this.exportQueue.add('generate-export', {
      userId,
      exportId,
      format,
    });

    return {
      message: 'Data export request submitted. You will receive an email when ready.',
      exportId,
    };
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    return {
      message: 'Account scheduled for deletion. It will be permanently deleted within 30 days.',
    };
  }
}
