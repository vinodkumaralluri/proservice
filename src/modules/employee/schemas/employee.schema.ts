import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Employee_Service } from '../../../enums/employee-service.enum';
import { EmployeeQualification } from '../../../enums/employee-qualification.enum';
import { Gender } from '../../../enums/gender.enum';

export type EmployeeDocument = Employee & Document;

@Schema()
export class Employee {
  @Prop()
  employee_id: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ required: true })
  company_id: string;

  @Prop()
  employee_code: string;

  @Prop({
    type: String,
    enum: Object.values(Employee_Service),
  })
  employeeservice: Employee_Service;

  @Prop()
  service_id: string;

  @Prop({ required: true })
  role_id: string;

  @Prop({
    type: String,
    enum: Object.values(EmployeeQualification),
  })
  qualification: EmployeeQualification;

  @Prop({
    type: String,
    enum: Object.values(Gender),
  })
  gender: Gender;

  @Prop()
  date_of_birth: string;

  @Prop()
  date_of_joining: string;

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

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
EmployeeSchema.index({ employee_id: 1 }, { unique: true });
