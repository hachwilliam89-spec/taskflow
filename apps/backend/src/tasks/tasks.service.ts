import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import {
  PaginatedResult,
  PaginationQueryDto,
} from './dto/pagination-query.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<unknown>> {
    // Deux requêtes en parallèle (Promise.all) plutôt qu'en séquence :
    // count() ne dépend pas du résultat de findMany(), donc pas de raison
    // d'attendre l'une pour lancer l'autre.
    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.task.count(),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
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
