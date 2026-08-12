import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * Forme normalisée de toute réponse d'erreur de l'API.
 * @Expose() documente les champs exposés au client (class-transformer),
 * @ApiProperty() documente la même chose côté Swagger.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 404 })
  @Expose()
  statusCode: number;

  @ApiProperty({
    example: 'Task 42 introuvable',
    description: 'Chaîne unique, ou tableau de messages pour les erreurs de validation',
  })
  @Expose()
  message: string | string[];

  @ApiProperty({ example: 'Not Found' })
  @Expose()
  error: string;

  @ApiProperty({ example: '2026-08-12T19:55:53.941Z' })
  @Expose()
  timestamp: string;

  @ApiProperty({ example: '/api/tasks/42' })
  @Expose()
  path: string;

  constructor(partial: Partial<ErrorResponseDto>) {
    Object.assign(this, partial);
  }
}
