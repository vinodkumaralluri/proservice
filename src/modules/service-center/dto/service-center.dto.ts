import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ServiceCenterDto {

  @ApiProperty({ example: 'C1', description: 'Company Id' })
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ example: 'SC1234', description: 'Service Center Code' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'E1', description: 'Employee Id of the Manager' })
  @IsNotEmpty()
  incharge: string;

  @ApiProperty({ example: 'email@product.com', description: 'email of the Service Center' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '94927985974', description: 'Phone number of the Service Center' })
  @IsNotEmpty()
  phone_number: string;

}
