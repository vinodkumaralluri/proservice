import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LocationType } from 'src/enums/entity-type.enum';

export type PickupDocument = Pickup & Document;

@Schema()
export class Pickup {
  @Prop()
  pickup_id: string;

  @Prop({required: true})
  location_id: string;

  @Prop({
    type: String,
    enum: Object.values(LocationType),
    required: true,
  })
  destination_type: LocationType;

  @Prop({required: true})
  pickup_person: string;

  @Prop({required: true})
  vehicle_id: string;

  @Prop()
  live_location: string;

  @Prop()
  items: any[];

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

export const PickupSchema = SchemaFactory.createForClass(Pickup);
PickupSchema.index({ pickup_id: 1 }, { unique: true });
