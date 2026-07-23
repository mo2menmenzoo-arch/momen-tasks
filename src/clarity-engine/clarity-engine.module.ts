import { Module } from '@nestjs/common';
import { ClarityEngineService } from './clarity-engine.service';
import { ClarityEngineController } from './clarity-engine.controller';
import { ClarityScore } from './scoring/clarity-score';
import { ZoneDistribution } from './scoring/zone-distribution';
import { StreakCalculator } from './scoring/streak-calculator';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '../shared/logger/logger.module';

@Module({
  imports: [PrismaModule, AuthModule, LoggerModule],
  providers: [
    ClarityEngineService,
    ClarityScore,
    ZoneDistribution,
    StreakCalculator,
  ],
  controllers: [ClarityEngineController],
  exports: [ClarityEngineService],
})
export class ClarityEngineModule {}
