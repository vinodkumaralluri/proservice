import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class TripDto {

  @ApiProperty({ example: 'AP35HG9693', description: 'Source Location' })
  @IsNotEmpty()
  source_location: string;

  @ApiProperty({ example: 'SDVSDKVSKD', description: 'Destination Location' })
  @IsNotEmpty()
  destination_location: string;

  @ApiProperty({ example: 'VEHICLE123', description: 'Vehicle Id' })
  @IsNotEmpty()
  vehicle_id: string;

}
