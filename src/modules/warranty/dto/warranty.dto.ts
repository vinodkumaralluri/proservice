import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class WarrantyDto {

  @ApiProperty({ example: 'WARRANTY1234', description: 'Warranty Code' })
  @IsNotEmpty()
  warranty_code: string;

  @ApiProperty({ example: 'I12', description: 'Product Item Id' })
  @IsNotEmpty()
  item_id: string;

  @ApiProperty({ example: '2 years', description: 'Duration of Warranty' })
  @IsNotEmpty()
  warranty_duration: string;

  @ApiProperty({ example: '2', description: 'Maximum Claims of the Warranty' })
  @IsNotEmpty()
  max_claims: number;

}
