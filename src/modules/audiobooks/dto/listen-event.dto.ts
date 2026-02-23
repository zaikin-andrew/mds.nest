import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ListenEventDto {
  @ApiProperty({ example: 'abc123' })
  @IsString()
  bookId: string;
}
