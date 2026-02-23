import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/api-response.dto';

export class AudiobookDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  foreignAuthor: boolean;

  @ApiPropertyOptional()
  duration?: number;

  @ApiPropertyOptional()
  path?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } })
  params?: Record<string, string[]>;

  @ApiPropertyOptional()
  liveReleaseYear?: number;

  @ApiPropertyOptional()
  annotation?: string;

  @ApiPropertyOptional()
  source?: string;

  @ApiPropertyOptional({ type: [String] })
  tracks?: string[];

  @ApiPropertyOptional()
  image?: string;
}

export class AudiobookListResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty({ type: [AudiobookDto] })
  data: AudiobookDto[];

  @ApiPropertyOptional({ type: PaginationMetaDto })
  meta?: PaginationMetaDto;
}

export class WeekSelectionItemDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  published: boolean;

  @ApiProperty()
  visibilityStartDate: Date;

  @ApiProperty({ type: [AudiobookDto] })
  audioBooks: AudiobookDto[];
}

export class WeekSelectionListResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty({ type: [WeekSelectionItemDto] })
  data: WeekSelectionItemDto[];
}

export class SearchNamesResultDto {
  @ApiProperty({ type: [String] })
  authors: string[];

  @ApiProperty({ type: [String] })
  works: string[];
}

export class SearchNamesResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty({ type: SearchNamesResultDto })
  data: SearchNamesResultDto;
}

export class AiSearchResultDto {
  @ApiProperty({ type: [AudiobookDto] })
  items: AudiobookDto[];

  @ApiProperty()
  aiSearches: number;
}

export class AiSearchResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty({ type: AiSearchResultDto })
  data: AiSearchResultDto;
}
