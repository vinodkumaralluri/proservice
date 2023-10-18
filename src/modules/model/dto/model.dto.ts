import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ModelDto {

  @ApiProperty({ example: 'P1', description: 'Product Id' })
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 'C1', description: 'Company Id' })
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ example: 'M123', description: 'Model Number' })
  @IsNotEmpty()
  model_number: string;

}
