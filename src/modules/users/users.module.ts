import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { AiSearch, AiSearchSchema } from '../audiobooks/schemas/ai-search.schema';
import { History, HistorySchema } from '../history/schemas/history.schema';
import { Playlist, PlaylistSchema } from '../playlist/schemas/playlist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: AiSearch.name, schema: AiSearchSchema },
      { name: History.name, schema: HistorySchema },
      { name: Playlist.name, schema: PlaylistSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
