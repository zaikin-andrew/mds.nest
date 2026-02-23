import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AudiobookDocument = HydratedDocument<Audiobook>;

@Schema({ toJSON: { getters: true }, toObject: { getters: true } })
export class Audiobook {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  author: string;

  @Prop({ default: false })
  foreignAuthor: boolean;

  @Prop()
  duration?: number;

  @Prop()
  path?: string;

  @Prop(
    raw({
      'Жанры/поджанры': { type: [String] },
      'Общие характеристики': { type: [String] },
      'Место действия': { type: [String] },
      'Время действия': { type: [String] },
      'Сюжетные ходы': { type: [String] },
      'Линейность сюжета': { type: [String] },
      'Возраст читателя': { type: [String] },
    }),
  )
  params?: Record<string, string[]>;

  @Prop()
  liveReleaseYear?: number;

  @Prop({
    get: function (this: Audiobook, value: string | undefined) {
      return value || this.aiAnnotation || '';
    },
  })
  annotation?: string;

  @Prop()
  aiAnnotation?: string;

  @Prop()
  source?: string;

  @Prop({ type: [String] })
  tracks?: string[];

  @Prop()
  image?: string;
}

export const AudiobookSchema = SchemaFactory.createForClass(Audiobook);
