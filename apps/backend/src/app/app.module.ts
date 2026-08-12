import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksModule } from '../tasks/tasks.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

@Module({
  imports: [PrismaModule, TasksModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Enregistré comme provider (token APP_FILTER) plutôt que via
    // app.useGlobalFilters() dans main.ts : ça passe par le système
    // d'injection de dépendances de Nest, donc le filtre peut lui-même
    // recevoir des dépendances injectées si besoin plus tard (ex: un
    // service de monitoring), ce qu'un enregistrement manuel dans
    // main.ts ne permet pas aussi proprement.
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
