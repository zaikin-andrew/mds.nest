import { Module } from '@nestjs/common';
import { AppVersionService } from './app-version.service';
import { AppVersionController } from './app-version.controller';
import { AppVersionSchema } from './schemas/app-version.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AppVersion } from './schemas/app-version.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AppVersion.name, schema: AppVersionSchema }])],
  controllers: [AppVersionController],
  providers: [AppVersionService],
})
export class AppVersionModule {}
