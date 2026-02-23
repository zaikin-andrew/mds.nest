import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubscriptionDocument = HydratedDocument<Subscription>;

export type SubscriptionStatus = 'INACTIVE' | 'ACTIVE';
export type SubscriptionDuration = 6 | 12;

@Schema()
export class Subscription {
  @Prop({ default: 0 })
  subscriberId: number;

  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ type: String, enum: ['INACTIVE', 'ACTIVE'], default: 'ACTIVE' })
  status: SubscriptionStatus;

  @Prop({ type: String, enum: ['Default'], default: 'Default' })
  type: string;

  @Prop({ default: () => new Date() })
  purchaseDate: Date;

  @Prop({ type: Number, enum: [6, 12], default: 12 })
  durationMonths: SubscriptionDuration;

  @Prop()
  nextPaymentDate?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
