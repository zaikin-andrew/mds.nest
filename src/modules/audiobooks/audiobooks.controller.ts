import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SkipListened } from 'src/common/decorators/skip-listened.decorator';
import { FindAllAudiobooksDto } from './dto/find-all.dto';
import { AudiobooksService } from './audiobooks.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('audiobooks')
export class AudiobooksController {
  constructor(private readonly audiobooksService: AudiobooksService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() dto: FindAllAudiobooksDto, @SkipListened() skipListened: boolean) {
    return this.audiobooksService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('random')
  getRandomAudiobook() {
    return this.audiobooksService.getRandomAudiobook();
  }
}
