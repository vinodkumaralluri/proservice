import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { LocationType } from 'src/enums/entity-type.enum';

export class PickupDto {

  @ApiProperty({ example: 'Service Center', description: 'Destination Location' })
  @IsNotEmpty()
  @IsEnum(LocationType)
  destination_type: LocationType;

  @ApiProperty({ example: 'AP35HG9693', description: 'Location Id' })
  @IsNotEmpty()
  location_id: string;

  @ApiProperty({ example: 'U12', description: 'User Id of the Delivery Person' })
  @IsNotEmpty()
  pickup_person: string;

  @ApiProperty({ example: 'VEHICLE123', description: 'Vehicle Id' })
  @IsNotEmpty()
  vehicle_id: string;

}
