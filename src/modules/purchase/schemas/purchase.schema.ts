import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DeliveryStatus } from 'src/enums/delivery-status.enum';

export type PurchaseDocument = Purchase & Document;

@Schema()
export class Purchase {
  @Prop()
  purchase_id: string;

  @Prop({required: true})
  item_id: string;

  @Prop({required: true})
  customer_id: string;

  @Prop({required: true})
  invoice_number: string;

  @Prop({required: true})
  purchase_date: string;

  @Prop({required: true})
  warranty: boolean;

  @Prop()
  warranty_id: string;

  @Prop({ required: true })
  purchase_price: number;

  @Prop()
  discount_code: string;

  @Prop({required: true, default: DeliveryStatus.Pending})
  delivery_status: DeliveryStatus;

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

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
PurchaseSchema.index({ purchase_id: 1 }, { unique: true });