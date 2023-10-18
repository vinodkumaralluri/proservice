import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProblemType } from '../../../enums/problem-type.enum';

export class ComplaintDto {

  @ApiProperty({ example: 'IT12', description: 'Item Id' })
  @IsNotEmpty()
  item_id: string;

  @ApiProperty({ example: 'IN12345', description: 'Invoice Number' })
  @IsNotEmpty()
  invoice_number: string;

  @ApiProperty({ example: 'Damage', description: 'Problem Type' })
  @IsEnum(ProblemType, {
    message: 'Invalid Problem type',
  })
  problem_type: ProblemType;

  @ApiProperty({ example: 'The Product is damaged', description: 'Complaint description' })
  @IsNotEmpty()
  complaint: string;

  @ApiProperty({ example: '18/08/2022', description: 'Date of Purchase' })
  @IsNotEmpty()
  purchase_date: string;

}
