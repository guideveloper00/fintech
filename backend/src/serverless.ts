import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { json } from 'express';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpHeader, HttpMethod } from './common/enums/main';

let cachedServer: Express | null = null;

async function bootstrap(): Promise<Express> {
  const app = await NestFactory.create(AppModule, {
    // Reduz verbosidade dos logs em produção
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>('FRONTEND_URL', '*');

  app.use(cookieParser());
  app.use(json({ limit: '5mb' })); // necessário para avatares em base64

  app.enableCors({
    origin: frontendUrl,
    methods: Object.values(HttpMethod),
    allowedHeaders: Object.values(HttpHeader),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );

  await app.init();

  return app.getHttpAdapter().getInstance() as Express;
}

export async function getServer(): Promise<Express> {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return cachedServer;
}
