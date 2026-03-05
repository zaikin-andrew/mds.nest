import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AiSearchDto {
  @ApiProperty({ example: 'a book about time travel' })
  @IsString()
  @MinLength(2)
  query: string;
}
