import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister les tâches (paginé)',
    description:
      'Renvoie une page de tâches triées par date de création décroissante. ' +
      'Utilise ?page= et ?limit= pour naviguer.',
  })
  // ApiOkResponse/ApiQuery lisent PaginationQueryDto grâce aux @ApiPropertyOptional
  // posés dessus (voir dto/pagination-query.dto.ts) — Swagger UI affiche
  // automatiquement les deux query params avec leurs valeurs par défaut.
  @ApiOkResponse({ description: 'Page de tâches + métadonnées de pagination' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une tâche par son id' })
  @ApiOkResponse({ description: 'Tâche trouvée' })
  @ApiNotFoundResponse({
    description: 'Aucune tâche avec cet id',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une tâche' })
  @ApiCreatedResponse({ description: 'Tâche créée' })
  @ApiBadRequestResponse({
    description: 'DTO invalide (voir "message" pour le détail des champs)',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une tâche (partiel)',
    description:
      'Accepte un sous-ensemble des champs (ex: { "completed": true } pour ' +
      'marquer une tâche comme terminée) — pas besoin de renvoyer les champs ' +
      "inchangés, contrairement à un PUT qui remplacerait toute la ressource.",
  })
  @ApiOkResponse({ description: 'Tâche mise à jour' })
  @ApiNotFoundResponse({
    description: 'Aucune tâche avec cet id',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'DTO invalide',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, dto);
  }
}
