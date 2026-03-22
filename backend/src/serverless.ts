/**
 * Serverless entry point for Vercel deployment.
 * Bootstraps the NestJS application without calling app.listen().
 * The Express instance is cached between invocations to avoid cold-start
 * penalty on every request.
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpHeader, HttpMethod } from './common/enums/main';

let cachedServer: Express | null = null;

async function bootstrap(): Promise<Express> {
  const app = await NestFactory.create(AppModule, {
    // Reduce log verbosity in production to keep Vercel logs clean
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>('FRONTEND_URL', '*');

  app.use(cookieParser());

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

  // init() without listen() — Vercel handles the HTTP layer
  await app.init();

  return app.getHttpAdapter().getInstance() as Express;
}

/** Returns a cached (or newly created) Express handler for the NestJS app. */
export async function getServer(): Promise<Express> {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return cachedServer;
}
