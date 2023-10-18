import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductType } from '../../../enums/product-type.enum';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop()
  product_id: string;

  @Prop()
  product_name: string;

  @Prop({
    type: String,
    enum: Object.values(ProductType),
    required: true,
  })
  product_type: ProductType;

  @Prop({ default: 0 })
  models: number;

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

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ product_id: 1 }, { unique: true });