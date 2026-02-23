import { Global, Module } from '@nestjs/common';
import { YandexStorageService } from './yandex-storage.service';

@Global()
@Module({
  providers: [YandexStorageService],
  exports: [YandexStorageService],
})
export class YandexStorageModule {}
