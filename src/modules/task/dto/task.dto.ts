import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '../../../enums/task-status.enum';

export class TaskDto {

  @ApiProperty({ example: 'C1', description: 'Company Id' })
  @IsNotEmpty()
  complaint_id: string;

  @ApiProperty({ example: 'THis is the First Task', description: 'Task Details' })
  @IsNotEmpty()
  task: string;

  @ApiProperty({ example: 'U12', description: 'User Id assigned with the Task' })
  @IsNotEmpty()
  assigned_to: string;

  @ApiProperty({ example: '18/08/2022', description: 'Date of the Task assigned' })
  @IsNotEmpty()
  assigned_date: string;

  @ApiProperty({ example: '10:00 A.M.', description: 'Time of the Task assigned' })
  @IsNotEmpty()
  assigned_time: string;

}
