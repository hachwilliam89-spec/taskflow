import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Acheter du lait', minLength: 1 })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional({ example: 'Demi-écrémé, 2 litres' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
