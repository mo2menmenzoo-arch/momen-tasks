import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from '../dist/app.module';
import { HttpExceptionFilter } from '../dist/common/filters/http-exception.filter';
import { PrismaExceptionFilter } from '../dist/common/filters/prisma-exception.filter';
import { LoggingInterceptor } from '../dist/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '../dist/common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from '../dist/common/interceptors/timeout.interceptor';

let cachedServer: any;

async function createServer() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    bufferLogs: true,
  });

  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
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
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(),
  );

  await app.init();
  return expressApp;
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await createServer();
  }
  return cachedServer(req, res);
}
