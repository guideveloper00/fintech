import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpHeader, HttpMethod } from './common/enums/main';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const port = config.getOrThrow<number>('PORT') ?? 3000;
  const frontendUrl = config.getOrThrow<string>('FRONTEND_URL') ?? '*';

  app.use(cookieParser());

  app.enableShutdownHooks();

  app.enableCors({
    origin: frontendUrl,
    methods: Object.values(HttpMethod),
    allowedHeaders: Object.values(HttpHeader),
    credentials: true, // obrigatório para enviar/receber HttpOnly cookies cross-origin
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
    new ClassSerializerInterceptor(app.get(Reflector)), // respeita @Exclude() nas entidades
    new ResponseInterceptor(),
  );

  await app.listen(port);

  logger.log(`Application running on port ${port}`);
}
bootstrap();