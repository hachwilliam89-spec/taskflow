import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      // NotFoundException est une HttpException Nest : elle sera
      // interceptée par HttpExceptionFilter et transformée en
      // ErrorResponseDto (statusCode 404) avant de partir au client.
      throw new NotFoundException(`Task ${id} introuvable`);
    }
    return task;
  }

  create(dto: CreateTaskDto) {
    return this.prisma.task.create({ data: dto });
  }
}
