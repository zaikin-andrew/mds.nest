import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MonthlyCountDocument = HydratedDocument<MonthlyCount>;

@Schema({ versionKey: false })
export class MonthlyCount {
  @Prop({ required: true })
  bookId: string;

  @Prop({ required: true })
  yyyymm: string;

  @Prop({ default: 0 })
  count: number;
}

export const MonthlyCountSchema = SchemaFactory.createForClass(MonthlyCount);

MonthlyCountSchema.index({ yyyymm: 1, count: -1 });
MonthlyCountSchema.index({ yyyymm: 1, bookId: 1 }, { unique: true });
