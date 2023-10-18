import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class AssignComplaintDto {

  @ApiProperty({ example: 'SC1', description: 'Service Center Id' })
  @IsNotEmpty()
  servicecenter_id: string;

}
