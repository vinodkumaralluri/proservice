import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LocationType } from 'src/enums/entity-type.enum';

export type DeliveryDocument = Delivery & Document;

@Schema()
export class Delivery {
  @Prop()
  delivery_id: string;

  @Prop({
    type: String,
    enum: Object.values(LocationType),
    required: true,
  })
  source_type: LocationType;

  @Prop({ required: true })
  location_id: string;

  @Prop({ required: true })
  delivery_person: string;

  @Prop({ required: true })
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

export const DeliverySchema = SchemaFactory.createForClass(Delivery);
DeliverySchema.index({ delivery_id: 1 }, { unique: true });

