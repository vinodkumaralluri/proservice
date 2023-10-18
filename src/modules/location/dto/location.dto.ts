import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EntityType } from 'src/enums/entity-type.enum';

export class LocationDto {

  @ApiProperty({ example: 'AP35HG9693', description: 'Vehicle Number' })
  @IsNotEmpty()
  latitude: string;

  @ApiProperty({ example: 'COM1', description: 'Vehicle Owner Name' })
  @IsNotEmpty()
  longitude: string;

  @ApiProperty({ example: 'HGKSDMVK141341', description: 'Vehicle Engine Number' })
  @IsNotEmpty()
  @IsEnum(EntityType)
  location_type: EntityType;

}
