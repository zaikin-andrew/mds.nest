import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthorDocument = HydratedDocument<Author>;

@Schema({ timestamps: true })
export class Author {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: false })
  foreignAuthor: boolean;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
