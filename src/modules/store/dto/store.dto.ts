import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class StoreDto {

  @ApiProperty({ example: 'C1', description: 'Company Id' })
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ example: 'SC1234', description: 'Store Code' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'E1', description: 'Employee Id of the Incharge' })
  @IsNotEmpty()
  incharge: string;

  @ApiProperty({ example: 'email@product.com', description: 'email of the Store' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '94927985974', description: 'Phone number of the Store' })
  @IsNotEmpty()
  phone_number: string;

}
