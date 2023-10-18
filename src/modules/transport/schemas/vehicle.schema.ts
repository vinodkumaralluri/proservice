import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema()
export class Vehicle {
  @Prop()
  vehicle_id: string;

  @Prop({required: true})
  vehicle_number: string;

  @Prop({required: true})
  owner_name: string;

  @Prop({required: true})
  company_id: string;

  @Prop({required: true})
  engine_number: string;

  @Prop({default: false})
  chasis_number: string;

  @Prop({required: true})
  maker_class: string;

  @Prop({required: true})
  vehicle_class: string;

  @Prop({required: true})
  body_type: string;

  @Prop({required: true})
  fuel_used: string;

  @Prop({required: true})
  cubic_capacity: string;

  @Prop({required: true})
  storage_capacity: string;

  @Prop({required: true})
  manufacturing_date: string;

  @Prop({required: true})
  registration_date: string;

  @Prop({required: true})
  valid_upto: string;

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

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
VehicleSchema.index({ vehicle_id: 1 }, { unique: true });