import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ItemDto {

  @ApiProperty({ example: 'M12', description: 'Model Id' })
  @IsNotEmpty()
  model_id: string;

  @ApiProperty({ example: 'dfbsfv23263232', description: 'Serial number of the Product Item' })
  @IsNotEmpty()
  serial_number: string;

  @ApiProperty({ example: '10000', description: 'Price of the Product Item' })
  @IsNotEmpty()
  price: string;

}
