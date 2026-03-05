import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SearchNamesDto {
  @ApiProperty({ example: 'Chekhov' })
  @IsString()
  @MinLength(2)
  query: string;
}
