import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DashboardModule } from './dashboard/dashboard.module';

type Env = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  DB_SYNCHRONIZE: string;
  DB_SSL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .required(),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.string().valid('true', 'false').default('false'),
        DB_SSL: Joi.string().valid('true', 'false').default('false'),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        FRONTEND_URL: Joi.string().default('http://localhost:5173'),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => {
        const databaseUrl = config.getOrThrow('DATABASE_URL');
        const dbSynchronize = config.getOrThrow('DB_SYNCHRONIZE');
        const dbSsl = config.getOrThrow('DB_SSL');

        const isProd = config.get('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: dbSynchronize === 'true',
          ssl: dbSsl === 'true' ? { rejectUnauthorized: false } : false,
          migrations: [isProd ? 'dist/database/migrations/*.js' : 'src/database/migrations/*.ts'],
          migrationsRun: isProd,
        };
      },
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
    DashboardModule,
  ],
})
export class AppModule {}