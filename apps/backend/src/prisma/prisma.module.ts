import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() rend PrismaService injectable partout dans l'app sans avoir
// à réimporter PrismaModule dans chaque feature module (TasksModule, etc.).
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
