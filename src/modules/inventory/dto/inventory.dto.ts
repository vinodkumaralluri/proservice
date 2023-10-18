import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ItemLocation } from 'src/enums/item-location.enum';
import { EntityType } from 'src/enums/entity-type.enum';

export class InventoryDto {

  @ApiProperty({ example: 'ST12', description: 'Store Id' })
  @IsNotEmpty()
  @IsEnum(EntityType)
  unit_type: EntityType;

  @ApiProperty({ example: 'ST12', description: 'Store Id' })
  @IsNotEmpty()
  unit_id: string;

  @ApiProperty({ example: 'IT12', description: 'Item Id' })
  @IsNotEmpty()
  item_id: string;

  @ApiProperty({ example: 'EM12', description: 'Employee Id of the Incharge' })
  incharge: string;

  @ApiProperty({ example: 'Company', description: 'Source of the Item Location' })
  @IsEnum(ItemLocation)
  source: ItemLocation;

}
