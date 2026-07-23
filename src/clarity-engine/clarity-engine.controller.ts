import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ClarityEngineService } from './clarity-engine.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RlsContextGuard } from '../common/guards/rls-context.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('clarity-engine')
@UseGuards(JwtAuthGuard, RlsContextGuard)
export class ClarityEngineController {
  constructor(private readonly clarityEngineService: ClarityEngineService) {}

  @Get('metrics')
  async getMetrics(
    @User('sub') userId: string,
    @Query('date') date: string,
  ) {
    const metricDate = date ? new Date(date) : new Date();
    return this.clarityEngineService.getMetrics(userId, metricDate);
  }

  @Get('metrics/history')
  async getMetricsHistory(
    @User('sub') userId: string,
    @Query('days') days: string,
  ) {
    return this.clarityEngineService.getMetricsHistory(
      userId,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Get('weekly-review')
  async getWeeklyReview(@User('sub') userId: string) {
    return this.clarityEngineService.getWeeklyReview(userId);
  }
}
