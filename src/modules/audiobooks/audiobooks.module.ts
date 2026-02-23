import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AudiobooksController } from './audiobooks.controller';
import { AudiobooksService } from './audiobooks.service';
import { Audiobook, AudiobookSchema } from './schemas/audiobook.schema';
import { AiSearch, AiSearchSchema } from './schemas/ai-search.schema';
import { ListenEvent, ListenEventSchema } from './schemas/listen-event.schema';
import { WeeklyCount, WeeklyCountSchema } from './schemas/weekly-count.schema';
import { MonthlyCount, MonthlyCountSchema } from './schemas/monthly-count.schema';
import { WeekSelection, WeekSelectionSchema } from '../selections/schemas/week-selection.schema';
import { History, HistorySchema } from '../history/schemas/history.schema';
import { Subscription, SubscriptionSchema } from '../users/schemas/subscription.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Audiobook.name, schema: AudiobookSchema },
      { name: AiSearch.name, schema: AiSearchSchema },
      { name: ListenEvent.name, schema: ListenEventSchema },
      { name: WeeklyCount.name, schema: WeeklyCountSchema },
      { name: MonthlyCount.name, schema: MonthlyCountSchema },
      { name: WeekSelection.name, schema: WeekSelectionSchema },
      { name: History.name, schema: HistorySchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  controllers: [AudiobooksController],
  providers: [AudiobooksService],
  exports: [AudiobooksService],
})
export class AudiobooksModule {}
