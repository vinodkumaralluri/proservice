import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TaskStatus } from '../../../enums/task-status.enum';

export type TaskDocument = Task & Document;

@Schema()
export class Task {
  @Prop()
  task_id: string;

  @Prop({ required: true })
  complaint_id: string;

  @Prop({ required: true })
  task: string;

  @Prop({ required: true })
  assigned_to: string;

  @Prop({ required: true })
  assigned_date: string;

  @Prop({ required: true })
  assigned_time: string;

  @Prop({
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.Pending,
  })
  task_status: TaskStatus;

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

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ task_id: 1 }, { unique: true });