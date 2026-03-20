import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';

type Env = {
  NODE_ENV: 'development' | 'test' | 'production';
  DATABASE_URL: string;
  DB_SYNCHRONIZE: string;
  DB_SSL: string;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .required(),
        DATABASE_URL: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.string().valid('true', 'false').default('false'),
        DB_SSL: Joi.string().valid('true', 'false').default('false'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => {
        const databaseUrl = config.getOrThrow('DATABASE_URL');
        const dbSynchronize = config.getOrThrow('DB_SYNCHRONIZE');
        const dbSsl = config.getOrThrow('DB_SSL');

        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: dbSynchronize === 'true',
          ssl: dbSsl === 'true' ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
})
export class AppModule {}