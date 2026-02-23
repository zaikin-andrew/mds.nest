import { Module } from '@nestjs/common';
import { AudiobooksService } from './audiobooks.service';
import { AudiobooksController } from './audiobooks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AudiobookSchema } from './schemas/audiobook.schema';
import { Audiobook } from './schemas/audiobook.schema';
import { ListenEvent, ListenEventSchema } from './schemas/listen-event.schema';
import { WeeklyCount, WeeklyCountSchema } from './schemas/weekly-count.schema';
import { MonthlyCount, MonthlyCountSchema } from './schemas/monthly-count.schema';
import { AiSearch, AiSearchSchema } from './schemas/ai-search.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Audiobook.name, schema: AudiobookSchema },
      { name: ListenEvent.name, schema: ListenEventSchema },
      { name: WeeklyCount.name, schema: WeeklyCountSchema },
      { name: MonthlyCount.name, schema: MonthlyCountSchema },
      { name: AiSearch.name, schema: AiSearchSchema },
    ]),
  ],
  controllers: [AudiobooksController],
  providers: [AudiobooksService],
  exports: [MongooseModule],
})
export class AudiobooksModule {}
