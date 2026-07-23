import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ClarityEngineProcessor } from './processors/clarity-engine.processor';
import { WeeklyReviewProcessor } from './processors/weekly-review.processor';
import { ImportProcessor } from './processors/import.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { CleanupProcessor } from './processors/cleanup.processor';
import { ExportProcessor } from './processors/export.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { ClarityEngineModule } from '../clarity-engine/clarity-engine.module';
import { LoggerModule } from '../shared/logger/logger.module';

@Module({
  imports: [
    PrismaModule,
    ClarityEngineModule,
    LoggerModule,
    BullModule.registerQueue({ name: 'clarity-engine' }),
    BullModule.registerQueue({ name: 'weekly-review' }),
    BullModule.registerQueue({ name: 'import' }),
    BullModule.registerQueue({ name: 'notification' }),
    BullModule.registerQueue({ name: 'cleanup' }),
    BullModule.registerQueue({ name: 'export' }),
  ],
  providers: [
    ClarityEngineProcessor,
    WeeklyReviewProcessor,
    ImportProcessor,
    NotificationProcessor,
    CleanupProcessor,
    ExportProcessor,
  ],
  exports: [],
})
export class JobsModule {}
