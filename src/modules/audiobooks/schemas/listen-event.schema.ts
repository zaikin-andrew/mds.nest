import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ListenEventDocument = HydratedDocument<ListenEvent>;

@Schema({ versionKey: false })
export class ListenEvent {
  @Prop({ required: true, default: () => new Date() })
  timestamp: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  bookId: string;

  @Prop({ required: true })
  isoWeek: string;

  @Prop({ required: true })
  yyyymm: string;
}

export const ListenEventSchema = SchemaFactory.createForClass(ListenEvent);

ListenEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
ListenEventSchema.index({ isoWeek: 1, bookId: 1 });
ListenEventSchema.index({ yyyymm: 1, bookId: 1 });
