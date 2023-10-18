import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from 'src/enums/gender.enum';
import { UserType } from 'src/enums/user-type.enum';

export type AdminDocument = Admin & Document;

@Schema()
export class Admin {
  @Prop()
  admin_id: string;

  @Prop({required: true})
  user_id: string;

  @Prop({required: true})
  first_name: string;

  @Prop({required: true})
  last_name: string;

  @Prop({required: true})
  user_type: UserType;

  @Prop()
  email: string;

  @Prop()
  phone_number: string;

  @Prop()
  gender: Gender;

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

export const AdminSchema = SchemaFactory.createForClass(Admin);
AdminSchema.index({ admin_id: 1 }, { unique: true });