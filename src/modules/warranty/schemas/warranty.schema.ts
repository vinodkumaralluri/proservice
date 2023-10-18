import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WarrantyDocument = Warranty & Document;

@Schema()
export class Warranty {
  @Prop()
  warranty_id: string;

  @Prop({required: true})
  warranty_code: string;

  @Prop({required: true})
  item_id: string;

  @Prop({default: false})
  item_purchase: boolean;

  @Prop({required: true})
  warranty_duration: string;

  @Prop({required: true})
  max_claims: number;

  @Prop({default: 0})
  claims: number;

  @Prop()
  start_date: string;

  @Prop()
  end_date: string;

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

export const WarrantySchema = SchemaFactory.createForClass(Warranty);
WarrantySchema.index({ warranty_id: 1 }, { unique: true });