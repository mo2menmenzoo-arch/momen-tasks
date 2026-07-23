import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { ConflictResolver } from './engine/conflict-resolver';
import { CursorManager } from './engine/cursor-manager';
import { OutboxProcessor } from './engine/outbox-processor';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '../shared/logger/logger.module';

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  providers: [SyncService, ConflictResolver, CursorManager, OutboxProcessor],
  controllers: [SyncController],
  exports: [SyncService, ConflictResolver],
})
export class SyncModule {}
