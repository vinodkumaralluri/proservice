import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ItemTransactionDto } from '../dto/itemTransaction.dto';

export type ItemBlockDocument = ItemBlock & Document;

@Schema()
export class ItemBlock {
  @Prop()
  item_block_id: string;

  @Prop({required: true})
  transaction: ItemTransactionDto;

  @Prop({required: true})
  precedingHash: string;

  @Prop({required: true})
  hash: string;

  @Prop({required: true})
  timestamp: string;

  @Prop({ default: 1 })
  status?: number;
}

export const ItemBlockSchema = SchemaFactory.createForClass(ItemBlock);
ItemBlockSchema.index({ item_block_id: 1 }, { unique: true });