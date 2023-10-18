import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ModuleType } from '../../../enums/module-type.enum';

export class ReviewDto {

  @ApiProperty({ example: 'Company', description: 'Review about' })
  @IsNotEmpty()
  @IsEnum(ModuleType)
  review_type: ModuleType;

  @ApiProperty({ example: 'CU12', description: 'Customer Id' })
  @IsNotEmpty()
  customer_id: string;

  @ApiProperty({ example: 'C12', description: 'Id of the entity reviewed for' })
  @IsNotEmpty()
  review_about: string;

  @ApiProperty({ example: 'This is the review about the Company', description: 'Review' })
  @IsNotEmpty()
  review: string;

}
