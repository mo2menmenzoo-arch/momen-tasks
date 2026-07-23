import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.use(helmet({
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(),
  );
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Momen Tasks backend listening on port ${port}`);
}
bootstrap();
