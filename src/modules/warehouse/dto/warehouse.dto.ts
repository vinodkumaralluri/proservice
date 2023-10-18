import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class WarehouseDto {

  @ApiProperty({ example: 'C1', description: 'Company Id' })
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ example: 'W1234', description: 'Warehouse Code' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'E1', description: 'Employee Id of the Warehouse' })
  @IsNotEmpty()
  incharge: string;

  @ApiProperty({ example: 'email@product.com', description: 'email of the Warehouse' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '94927985974', description: 'Phone number of the Warehouse' })
  @IsNotEmpty()
  phone_number: string;

}
