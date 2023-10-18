import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ItemStatus } from '../../../enums/item-status.enum';
import { ItemLocation } from 'src/enums/item-location.enum';

export type ItemDocument = Item & Document;

@Schema()
export class Item {
  @Prop()
  item_id: string;

  @Prop({required: true})
  model_id: string;

  @Prop({required: true})
  serial_number: string;

  @Prop()
  item_hash: string;

  @Prop({required: true})
  price: string;

  @Prop({
    type: String,
    enum: Object.values(ItemLocation),
    default: ItemLocation.Factory,
  })
  item_location: ItemLocation;

  @Prop({
    type: String,
    enum: Object.values(ItemStatus),
    default: ItemStatus.Available,
  })
  item_status: ItemStatus;

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

export const ItemSchema = SchemaFactory.createForClass(Item);
ItemSchema.index({ item_id: 1 }, { unique: true });