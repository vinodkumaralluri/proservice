import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LocationType } from 'src/enums/entity-type.enum';

export class DeliveryDto {

  @ApiProperty({ example: 'Warehouse', description: 'Source Location' })
  @IsNotEmpty()
  @IsEnum(LocationType)
  source_type: LocationType;

  @ApiProperty({ example: 'AP35HG9693', description: 'Location Id' })
  @IsNotEmpty()
  location_id: string;

  @ApiProperty({ example: 'U12', description: 'User Id of the Delivery Person' })
  @IsNotEmpty()
  delivery_person: string;

  @ApiProperty({ example: 'VEHICLE123', description: 'Vehicle Id' })
  @IsNotEmpty()
  vehicle_id: string;

}
