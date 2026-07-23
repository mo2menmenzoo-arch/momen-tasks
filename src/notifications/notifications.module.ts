import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '../shared/logger/logger.module';

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
