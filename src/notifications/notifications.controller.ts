import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RlsContextGuard } from '../common/guards/rls-context.guard';
import { User } from '../common/decorators/user.decorator';
import { NotificationEntity } from './entities/notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @User('sub') userId: string,
    @Query() query: NotificationQueryDto,
  ): Promise<NotificationEntity[]> {
    return this.notificationsService.findAll(userId, query);
  }

  @Patch(':id/read')
  async markRead(
    @User('sub') userId: string,
    @Param('id') notificationId: string,
  ): Promise<NotificationEntity> {
    return this.notificationsService.markRead(userId, notificationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @User('sub') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.cancel(userId, notificationId);
  }
}
