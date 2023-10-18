import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EntityType } from 'src/enums/entity-type.enum';

export type LocationDocument = Location & Document;

@Schema()
export class Location {
  @Prop()
  location_id: string;

  @Prop({required: true})
  latitude: string;

  @Prop({required: true})
  longitude: string;

  @Prop({
    type: String,
    enum: Object.values(EntityType),
  })
  location_type: EntityType;

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

export const LocationSchema = SchemaFactory.createForClass(Location);
LocationSchema.index({ location_id: 1 }, { unique: true });