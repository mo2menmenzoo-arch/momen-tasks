import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '../shared/logger/logger.module';

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeGateway, RealtimeService],
})
export class RealtimeModule {}
