import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    const critical = ['FRONTEND_URL', 'API_URL', 'DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY'];
    const optional = ['RESEND_API_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'APPLE_CLIENT_ID', 'REDIS_URL'];

    const check = (vars: string[]) =>
      Object.fromEntries(vars.map((v) => [v, !!process.env[v]]));

    let dbConnected = false;
    let dbError: string | null = null;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch (e: any) {
      dbError = e.message;
      this.logger.error(`Health check DB failed: ${e.message}`);
    }

    const criticalVars = check(critical);
    const allCriticalSet = Object.values(criticalVars).every(Boolean);

    return {
      status: allCriticalSet && dbConnected ? 'ok' : 'degraded',
      service: 'momen-tasks-backend',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      databaseError: dbError,
      env: {
        critical: criticalVars,
        optional: check(optional),
      },
    };
  }
}
