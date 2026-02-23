import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipListened } from '../../common/decorators/skip-listened.decorator';
import type { UserInfo } from '../../common/interfaces/user-info.interface';
import { AudiobooksService } from './audiobooks.service';
import { FindAllAudiobooksDto } from './dto/find-all.dto';
import { AiSearchDto } from './dto/ai-search.dto';
import { ListenEventDto } from './dto/listen-event.dto';
import { SearchNamesDto } from './dto/search-names.dto';
import {
  AudiobookListResponseDto,
  WeekSelectionListResponseDto,
  SearchNamesResponseDto,
  AiSearchResponseDto,
} from './dto/audiobook-response.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('audiobooks')
@ApiBearerAuth()
@Controller('audiobooks')
export class AudiobooksController {
  constructor(private readonly audiobooksService: AudiobooksService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Search/filter audiobooks' })
  @ApiOkResponse({ type: AudiobookListResponseDto })
  findAll(
    @Query() dto: FindAllAudiobooksDto,
    @CurrentUser() user: UserInfo,
    @SkipListened() skipListened: boolean,
  ) {
    return this.audiobooksService.findAll(dto, user.id, skipListened);
  }

  @UseGuards(AuthGuard)
  @Get('random')
  @ApiOperation({ summary: 'Get a random audiobook' })
  @ApiOkResponse({ type: AudiobookListResponseDto })
  getRandom(@CurrentUser() user: UserInfo, @SkipListened() skipListened: boolean) {
    return this.audiobooksService.getRandom(user.id, skipListened);
  }

  @UseGuards(AuthGuard)
  @Get('top-week')
  @ApiOperation({ summary: 'Top audiobooks this week' })
  @ApiOkResponse({ type: AudiobookListResponseDto })
  getTopWeek() {
    return this.audiobooksService.getTopWeek();
  }

  @UseGuards(AuthGuard)
  @Get('top-month')
  @ApiOperation({ summary: 'Top audiobooks this month' })
  @ApiOkResponse({ type: AudiobookListResponseDto })
  getTopMonth() {
    return this.audiobooksService.getTopMonth();
  }

  @UseGuards(AuthGuard)
  @Get('week-selection')
  @ApiOperation({ summary: 'Published week selections (last 6 months)' })
  @ApiOkResponse({ type: WeekSelectionListResponseDto })
  getWeekSelection() {
    return this.audiobooksService.getWeekSelection();
  }

  @UseGuards(AuthGuard)
  @Get('search/names')
  @ApiOperation({ summary: 'Autocomplete authors & titles by string' })
  @ApiOkResponse({ type: SearchNamesResponseDto })
  searchNames(@Query() dto: SearchNamesDto) {
    return this.audiobooksService.searchNames(dto.query);
  }

  @UseGuards(AuthGuard)
  @Get('similar/:storyId')
  @ApiOperation({ summary: 'Find similar audiobooks (requires subscription)' })
  @ApiOkResponse({ type: AudiobookListResponseDto })
  findSimilar(@Param('storyId') storyId: string, @CurrentUser() user: UserInfo) {
    return this.audiobooksService.findSimilar(storyId, user.id);
  }

  @UseGuards(AuthGuard)
  @Post('ai-search')
  @ApiOperation({ summary: 'AI-powered search (limited for free users)' })
  @ApiOkResponse({ type: AiSearchResponseDto })
  aiSearch(@Body() dto: AiSearchDto, @CurrentUser() user: UserInfo) {
    return this.audiobooksService.aiSearch(dto.query, user.id);
  }

  @UseGuards(AuthGuard)
  @Post('event/listen')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record a listen event' })
  listenEvent(@Body() dto: ListenEventDto, @CurrentUser() user: UserInfo) {
    return this.audiobooksService.recordListenEvent(dto.bookId, user.id);
  }
}
