import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AiSearchDocument = HydratedDocument<AiSearch>;

@Schema()
export class AiSearch {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ default: 0 })
  searches: number;
}

export const AiSearchSchema = SchemaFactory.createForClass(AiSearch);
