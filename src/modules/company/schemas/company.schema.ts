import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from 'src/enums/gender.enum';
import { CompanyType } from 'src/enums/company-type.enum';

export type CompanyDocument = Company & Document;

@Schema()
export class Company {
  @Prop()
  company_id: string;

  @Prop({required: true})
  user_id: string;

  @Prop({required: true})
  company_name: string;

  @Prop({
    type: String,
    enum: Object.values(CompanyType),
  })
  company_type: CompanyType;

  @Prop()
  email: string;

  @Prop()
  contact_number: string;

  @Prop()
  toll_free: string;

  @Prop({required: true})
  owner_first_name: string;
  
  @Prop({required: true})
  owner_last_name: string;

  @Prop({required: true})
  owner_phone_number: string;

  @Prop({required: true})
  owner_email: string;

  @Prop({required: true})
  owner_gender: Gender;

  @Prop({required: true})
  owner_dob: string;

  @Prop({ required: true })
  head_office: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  pincode: string;

  @Prop({ default: 0 })
  factories: number;

  @Prop({ default: 0 })
  warehouses: number;

  @Prop({ default: 0 })
  stores: number;

  @Prop({ default: 0 })
  service_centers: number;

  @Prop({ default: 0 })
  products: number;

  @Prop({ default: 0 })
  employees: number;

  @Prop({ default: 0 })
  complaints: number;

  @Prop({ default: 0 })
  reviews: number;

  @Prop({ default: 0 })
  rating: number;

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

export const CompanySchema = SchemaFactory.createForClass(Company);
CompanySchema.index({ company_id: 1 }, { unique: true });