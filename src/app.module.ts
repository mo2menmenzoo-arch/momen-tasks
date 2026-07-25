import { Module, NestModule, MiddlewareConsumer, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import bullmqConfig from './config/bullmq.config';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './shared/logger/logger.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ZonesModule } from './zones/zones.module';
import { TasksModule } from './tasks/tasks.module';
import { FocusSessionsModule } from './focus-sessions/focus-sessions.module';
import { TemplatesModule } from './templates/templates.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SyncModule } from './sync/sync.module';
import { ClarityEngineModule } from './clarity-engine/clarity-engine.module';
import { ImportsModule } from './imports/imports.module';
import { RealtimeModule } from './realtime/realtime.module';
import { JobsModule } from './jobs/jobs.module';
import { RlsMiddleware } from './common/middleware/rls.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

const isServerless = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

function getDynamicImports(): any[] {
  const imports: any[] = [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, databaseConfig, jwtConfig, redisConfig, bullmqConfig],
    }),
    ScheduleModule.forRoot(),
    LoggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ZonesModule,
    TasksModule,
    FocusSessionsModule,
    TemplatesModule,
    NotificationsModule,
    SyncModule,
    ClarityEngineModule,
    ImportsModule,
  ];

  if (!isServerless) {
    imports.push(
      BullModule.forRootAsync({
        useFactory: (config: ConfigService) => {
          const redisConfig = config.get('REDIS_CONFIG');
          return {
            connection: {
              host: redisConfig?.host ?? 'localhost',
              port: redisConfig?.port ?? 6379,
              password: redisConfig?.password,
              tls: redisConfig?.tls,
            },
          };
        },
        inject: [ConfigService],
      }),
      RealtimeModule,
      JobsModule,
    );
  }

  return imports;
}

@Module({
  imports: getDynamicImports(),
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RlsMiddleware).forRoutes('*');
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}
