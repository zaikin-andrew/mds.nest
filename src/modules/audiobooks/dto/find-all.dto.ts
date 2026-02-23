import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindAllAudiobooksDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'Достоевский' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  genres?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  characteristics?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  setting?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  period?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  plotDevices?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  plotLinearity?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  readerAge?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  foreignAuthor?: boolean;

  @ApiPropertyOptional({ example: 600 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationMin?: number;

  @ApiPropertyOptional({ example: 3600 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationMax?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  releaseYearMin?: number;

  @ApiPropertyOptional({ example: 2025 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  releaseYearMax?: number;

  @ApiPropertyOptional({ example: 'mds' })
  @IsOptional()
  @IsString()
  source?: string;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map((s) => s.trim());
  return [];
}
