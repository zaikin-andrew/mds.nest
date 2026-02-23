import { Module } from '@nestjs/common';
import { UtmService } from './utm.service';
import { UtmController } from './utm.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Utm, UtmSchema } from './schemas/utm.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Utm.name, schema: UtmSchema }])],
  controllers: [UtmController],
  providers: [UtmService],
})
export class UtmModule {}
