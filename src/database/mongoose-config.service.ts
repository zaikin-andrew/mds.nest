import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly appConfig: AppConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.appConfig.mongoUrl,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
    };
  }
}