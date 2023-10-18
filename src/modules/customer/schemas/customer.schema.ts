import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from '../../../enums/gender.enum';

export type CustomerDocument = Customer & Document;

@Schema()
export class Customer {
  @Prop()
  customer_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  first_name: string;

  @Prop()
  last_name: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  pincode: string;

  @Prop({
    type: String,
    enum: Object.values(Gender),
  })
  gender: Gender;

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

export const CustomerSchema = SchemaFactory.createForClass(Customer);
CustomerSchema.index({ customer_id: 1 }, { unique: true });
