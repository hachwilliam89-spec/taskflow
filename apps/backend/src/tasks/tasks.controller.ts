import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les tâches' })
  @ApiResponse({ status: 200, description: 'Liste des tâches' })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une tâche par son id' })
  @ApiResponse({ status: 200, description: 'Tâche trouvée' })
  @ApiResponse({ status: 404, description: 'Tâche introuvable', type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une tâche' })
  @ApiResponse({ status: 201, description: 'Tâche créée' })
  @ApiResponse({ status: 400, description: 'DTO invalide', type: ErrorResponseDto })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }
}
