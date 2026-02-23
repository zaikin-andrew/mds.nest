import { Module } from '@nestjs/common';
import { SearchParamsService } from './search-params.service';
import { SearchParamsController } from './search-params.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchParams, SearchParamsSchema } from './schemas/search-params.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: SearchParams.name, schema: SearchParamsSchema }])],
  controllers: [SearchParamsController],
  providers: [SearchParamsService],
})
export class SearchParamsModule {}
