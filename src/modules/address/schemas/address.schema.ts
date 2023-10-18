import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EntityType } from 'src/enums/entity-type.enum';

export type AddressDocument = Address & Document;

@Schema()
export class Address {
  @Prop()
  address_id: string;

  @Prop({ required: true })
  company_id: string;

  @Prop({ required: true })
  entity_id: string;

  @Prop({required: true})
  entity_type: EntityType;

  @Prop()
  house_no: string;

  @Prop()
  plot_no: string;

  @Prop()
  landmark: string;

  @Prop()
  street: string;

  @Prop()
  area: string;

  @Prop()
  city: string;

  @Prop()
  district: string;

  @Prop()
  state: string;

  @Prop()
  pincode: string;

  @Prop({required: true})
  latitude: string;

  @Prop({required: true})
  longitude: string;

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

export const AddressSchema = SchemaFactory.createForClass(Address);
AddressSchema.index({ address_id: 1 }, { unique: true });