import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TripDocument = Trip & Document;

@Schema()
export class Trip {
  @Prop()
  trip_id: string;

  @Prop({required: true})
  source_location: string;

  @Prop({required: true})
  destination_location: string;

  @Prop({required: true})
  vehicle_id: string;

  @Prop()
  live_location: string[];

  @Prop()
  items: string[];

  @Prop()
  started_at: string;

  @Prop()
  ended_at: string;

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

export const TripSchema = SchemaFactory.createForClass(Trip);
TripSchema.index({ trip_id: 1 }, { unique: true });