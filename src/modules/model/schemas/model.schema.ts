import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ModelsDocument = Models & Document;

@Schema()
export class Models {
  @Prop()
  model_id: string;

  @Prop({required: true})
  product_id: string;

  @Prop({required: true})
  company_id: string;

  @Prop({required: true})
  model_number: string;

  @Prop({ default: 0 })
  total_items: number;

  @Prop({ default: 0 })
  sold_items: number;

  @Prop({ default: 0 })
  available_items: number;

  @Prop({ default: 0 })
  complaints: number;

  @Prop({ default: 0 })
  reviews: number;

  @Prop({ default: 0 })
  rating: number;

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

export const ModelsSchema = SchemaFactory.createForClass(Models);
ModelsSchema.index({ model_id: 1 }, { unique: true });