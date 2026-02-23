import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import http from 'node:http';
import https from 'node:https';

import { User, UserSchema } from '../modules/users/schemas/user.schema';
import { FirebaseService } from './firebase/firebase.service';
import { VkService } from './vk/vk.service';
import { OpenaiService } from './openai/openai.service';
import { YandexStorageService } from './yandex-storage/yandex-storage.service';
import { RustoreService } from './rustore/rustore.service';

const keepAliveHttp = new http.Agent({ keepAlive: true, maxSockets: 100 });
const keepAliveHttps = new https.Agent({ keepAlive: true, maxSockets: 100 });

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        httpAgent: keepAliveHttp,
        httpsAgent: keepAliveHttps,
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [FirebaseService, VkService, OpenaiService, YandexStorageService, RustoreService],
  exports: [
    FirebaseService,
    VkService,
    OpenaiService,
    YandexStorageService,
    RustoreService,
    HttpModule,
    MongooseModule,
  ],
})
export class ServicesModule {}
