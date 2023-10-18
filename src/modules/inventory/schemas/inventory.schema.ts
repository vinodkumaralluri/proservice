import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EntityType } from 'src/enums/entity-type.enum';
import { InventoryStatus } from '../../../enums/inventory-status.enum';

export type InventoryDocument = Inventory & Document;

@Schema()
export class Inventory {
  @Prop()
  inventory_id: string;

  @Prop({ 
    type: String,
    enum: Object.values(EntityType),
    required: true,
  })
  unit_type: EntityType;

  @Prop({ required: true })
  unit_id: string;

  @Prop()
  item_id: string;

  @Prop()
  incharge: string;

  @Prop()
  sold_by: string;

  @Prop({
    type: String,
    enum: Object.values(InventoryStatus),
    default: InventoryStatus.Available,
  })
  inventory_status: InventoryStatus;

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

export const InventorySchema = SchemaFactory.createForClass(Inventory);
InventorySchema.index({ inventory_id: 1 }, { unique: true });