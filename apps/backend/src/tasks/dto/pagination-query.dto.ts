import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Query params arrivent TOUJOURS en string brute dans l'URL
// (?page=2&limit=10 → { page: "2", limit: "10" }). @Type(() => Number)
// dit à class-transformer de les convertir en Number AVANT que
// class-validator applique @IsInt/@Min/@Max — sans ça, "2" échouerait
// @IsInt() puisque c'est une string, pas un number.
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Numéro de page (commence à 1)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: 'Nombre de tâches par page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
