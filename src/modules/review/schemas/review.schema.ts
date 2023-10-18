import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ModuleType } from '../../../enums/module-type.enum';

export type ReviewDocument = Review & Document;

@Schema()
export class Review {
  @Prop()
  review_id: string;

  @Prop({
    type: String,
    enum: Object.values(ModuleType),
    required: true,
  })
  review_type: ModuleType;

  @Prop({ required: true })
  review_about: string;

  @Prop({ required: true })
  customer_id: string;

  @Prop({ required: true })
  review: string;

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

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ review_id: 1 }, { unique: true });