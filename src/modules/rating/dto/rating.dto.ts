import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ModuleType } from '../../../enums/module-type.enum';

export class RatingDto {

  @ApiProperty({ example: 'Company', description: 'Rating about' })
  @IsNotEmpty()
  @IsEnum(ModuleType)
  rating_type: ModuleType;

  @ApiProperty({ example: 'CU12', description: 'Customer Id' })
  @IsNotEmpty()
  customer_id: string;

  @ApiProperty({ example: 'C12', description: 'Id of the entity rated for' })
  @IsNotEmpty()
  rating_about: string;

  @ApiProperty({ example: '9', description: 'This is the rating about the Company' })
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ example: '10', description: 'This is the maximum rating' })
  @IsNotEmpty()
  max_rating: number;

}
