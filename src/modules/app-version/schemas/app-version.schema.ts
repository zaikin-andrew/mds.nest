import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AppVersionDocument = HydratedDocument<AppVersion>;

export type OperationSystem = 'IOS' | 'ANDROID' | 'MACOS';

@Schema()
export class AppVersion {
  @Prop({ required: true, unique: true, type: String, enum: ['IOS', 'ANDROID', 'MACOS'] })
  operationSystem: OperationSystem;

  @Prop({ required: true })
  version: number;
}

export const AppVersionSchema = SchemaFactory.createForClass(AppVersion);
