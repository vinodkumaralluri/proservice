import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreDocument = Store & Document;

@Schema()
export class Store {
  @Prop()
  store_id: string;

  @Prop({ required: true })
  company_id: string;

  @Prop()
  code: string;

  @Prop()
  incharge: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone_number: string;

  @Prop({ default: 0 })
  employees: number;

  @Prop({ default: 0 })
  inventory: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviews: number;

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

export const StoreSchema = SchemaFactory.createForClass(Store);
StoreSchema.index({ store_id: 1 }, { unique: true });