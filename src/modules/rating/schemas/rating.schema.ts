import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ModuleType } from '../../../enums/module-type.enum';

export type RatingDocument = Rating & Document;

@Schema()
export class Rating {
  @Prop()
  rating_id: string;

  @Prop({
    type: String,
    enum: Object.values(ModuleType),
    required: true,
  })
  rating_type: ModuleType;

  @Prop({ required: true })
  rating_about: string;

  @Prop({ required: true })
  customer_id: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  max_rating: number;

  @Prop({ required: true })
  created_at: string;

  @Prop({ required: true })
  created_by: string;

  @Prop()
  updated_at: string;

  @Prop()
  updated_by: string;

  @Prop({ default: 1 })
  status?: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
RatingSchema.index({ rating_id: 1 }, { unique: true });