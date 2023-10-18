import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TaskStatus } from 'src/enums/task-status.enum';
import { ProblemType } from '../../../enums/problem-type.enum';

export type ComplaintDocument = Complaint & Document;

@Schema()
export class Complaint {
  @Prop()
  complaint_id: string;

  @Prop({ required: true })
  item_id: string;

  @Prop({ required: true })
  invoice_number: string;

  @Prop({
    type: String,
    enum: Object.values(ProblemType),
    required: true,
  })
  problem_type: ProblemType;

  @Prop({ required: true })
  complaint: string;

  @Prop({ required: true })
  purchase_date: string;

  @Prop()
  servicecenter_id: string;

  @Prop({
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.Pending,
    required: true,
  })
  complaint_status: TaskStatus;

  @Prop({ default: 0 })
  tasks_assigned: number;

  @Prop({ default: 0 })
  tasks_completed: number;

  @Prop({ default: 0 })
  tasks_pending: number;

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

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);
ComplaintSchema.index({ complaint_id: 1 }, { unique: true });