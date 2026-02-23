import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SearchParamsDocument = HydratedDocument<SearchParams>;

@Schema({ timestamps: true })
export class SearchParams {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ type: [String], default: [] })
  values: string[];
}

export const SearchParamsSchema = SchemaFactory.createForClass(SearchParams);
