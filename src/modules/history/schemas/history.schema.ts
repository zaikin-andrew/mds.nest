import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HistoryDocument = HydratedDocument<History>;

@Schema()
export class History {
  @Prop({ required: true })
  audioBookId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  positionInSeconds: number;

  @Prop({ required: true })
  isListened: boolean;

  @Prop({ required: true })
  updatedAt: Date;
}

export const HistorySchema = SchemaFactory.createForClass(History);

HistorySchema.index({ audioBookId: 1, userId: 1 }, { unique: true });
