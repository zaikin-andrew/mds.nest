import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AiSearchDto {
  @ApiProperty({ example: 'книга про путешествия во времени' })
  @IsString()
  @MinLength(2)
  query: string;
}
