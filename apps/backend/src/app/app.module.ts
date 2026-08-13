import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksModule } from '../tasks/tasks.module';
import { HealthModule } from '../health/health.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
import { validateEnv } from '../config/env.validation';

@Module({
  imports: [
    // isGlobal: true → ConfigService injectable partout sans réimporter
    // ConfigModule dans chaque module. `validate` est appelé une seule fois
    // au boot avec process.env ; si validateEnv() lève, Nest ne démarre pas.
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    TasksModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Enregistrés comme providers (tokens APP_FILTER / APP_INTERCEPTOR)
    // plutôt que via app.useGlobalFilters()/useGlobalInterceptors() dans
    // main.ts : ça passe par le système d'injection de dépendances de
    // Nest, donc ils peuvent eux-mêmes recevoir des dépendances injectées
    // si besoin plus tard (ex: un service de monitoring), ce qu'un
    // enregistrement manuel dans main.ts ne permet pas aussi proprement.
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
