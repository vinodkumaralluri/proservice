import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Task, TaskSchema } from './schemas/task.schema';
import { Complaint, ComplaintSchema } from '../complaint/schemas/complaint.schema';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Complaint.name, schema: ComplaintSchema },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
