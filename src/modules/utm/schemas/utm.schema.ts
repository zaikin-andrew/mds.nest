import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UtmDocument = HydratedDocument<Utm>;

@Schema()
export class Utm {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true, unique: true })
  utm: string;

  @Prop({ required: true })
  eventName: string;

  @Prop({ required: true, default: '' })
  eventText: string;

  @Prop()
  publishDate?: Date;
}

export const UtmSchema = SchemaFactory.createForClass(Utm);
