import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class FactoryDto {

  @ApiProperty({ example: 'C1', description: 'Company Id' })
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ example: 'F1234', description: 'Factory Code' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'E1', description: 'Employee Id of the Factory' })
  @IsNotEmpty()
  incharge: string;

  @ApiProperty({ example: 'email@product.com', description: 'email of the Factory' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '94927985974', description: 'Phone number of the Factory' })
  @IsNotEmpty()
  phone_number: string;

}
