import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeeklyCountDocument = HydratedDocument<WeeklyCount>;

@Schema({ versionKey: false })
export class WeeklyCount {
  @Prop({ required: true })
  bookId: string;

  @Prop({ required: true })
  isoWeek: string;

  @Prop({ default: 0 })
  count: number;
}

export const WeeklyCountSchema = SchemaFactory.createForClass(WeeklyCount);

WeeklyCountSchema.index({ isoWeek: 1, count: -1 });
WeeklyCountSchema.index({ isoWeek: 1, bookId: 1 }, { unique: true });
