import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProductType } from 'src/enums/product-type.enum';

export class ProductDto {

  @ApiProperty({ example: 'Television', description: 'Name of the Product' })
  @IsNotEmpty()
  product_name: string;

  @ApiProperty({ example: 'Electronics', description: 'Product Type' })
  @IsEnum(ProductType, {
    message: 'Invalid product type',
  })
  product_type: ProductType;

}
