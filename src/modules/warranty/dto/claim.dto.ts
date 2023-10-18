import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ClaimDto {

  @ApiProperty({ example: 'WA1', description: 'Warranty Id' })
  @IsNotEmpty()
  warranty_id: string;

  @ApiProperty({ example: 'COM1', description: 'Complaint Id' })
  @IsNotEmpty()
  complaint_id: string;

}
