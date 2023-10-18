import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class VehicleDto {

  @ApiProperty({ example: 'AP35HG9693', description: 'Vehicle Number' })
  @IsNotEmpty()
  vehicle_number: string;

  @ApiProperty({ example: 'Owner Name', description: 'Vehicle Owner Name' })
  @IsNotEmpty()
  owner_name: string;

  @ApiProperty({ example: 'COM1', description: 'Company Id' })
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({ example: 'HGKSDMVK141341', description: 'Vehicle Engine Number' })
  @IsNotEmpty()
  engine_number: string;

  @ApiProperty({ example: 'SFIVSFMVSKD5645', description: 'Vehicle Chasis Number' })
  @IsNotEmpty()
  chasis_number: string;

  @ApiProperty({ example: 'TATA MOTORS', description: 'Vehicle Maker Class' })
  @IsNotEmpty()
  maker_class: string;

  @ApiProperty({ example: 'MOTOR TRUCK', description: 'Vehicle Owner Name' })
  @IsNotEmpty()
  vehicle_class: string;

  @ApiProperty({ example: 'TRUCK', description: 'Vehicle Body Type' })
  @IsNotEmpty()
  body_type: string;

  @ApiProperty({ example: 'PETROL', description: 'FUEL Used' })
  @IsNotEmpty()
  fuel_used: string;

  @ApiProperty({ example: '1499', description: 'Vehicle CC' })
  @IsNotEmpty()
  cubic_capacity: string;

  @ApiProperty({ example: '2000', description: 'Vehicle Storage Capacity' })
  @IsNotEmpty()
  storage_capacity: string;

  @ApiProperty({ example: '18/10/2019', description: 'Vehicle Manufacturing date' })
  @IsNotEmpty()
  manufacturing_date: string;

  @ApiProperty({ example: '18/01/2020', description: 'Vehicle Registration date' })
  @IsNotEmpty()
  registration_date: string;

  @ApiProperty({ example: '18/01/2035', description: 'Vehicle Registration validity' })
  @IsNotEmpty()
  valid_upto: string;

}
