import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WeekSelectionDocument = HydratedDocument<WeekSelection>;

@Schema()
export class WeekSelection {
  @Prop()
  title: string;

  @Prop()
  published: boolean;

  @Prop()
  visibilityStartDate: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Audiobook' }] })
  audioBooks: Types.ObjectId[];
}

export const WeekSelectionSchema = SchemaFactory.createForClass(WeekSelection);
