import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class PurchaseDto {

  @ApiProperty({ example: 'M1', description: 'Item Id' })
  @IsNotEmpty()
  item_id: string;

  @ApiProperty({ example: 'CU1', description: 'Customer Id' })
  @IsNotEmpty()
  customer_id: string;

  @ApiProperty({ example: 'AP0824NJNSJFD', description: 'Invoice Number' })
  @IsNotEmpty()
  invoice_number: string;

  @ApiProperty({ example: '18/06/2022', description: 'Date of Purchase' })
  @IsNotEmpty()
  purchase_date: string;

  @ApiProperty({ example: 'W12', description: 'warranty id' })
  @IsNotEmpty()
  warranty_id: string;

  @ApiProperty({ example: '20000', description: 'Price at which the item is purchased' })
  @IsNotEmpty()
  purchase_price: number;

  @ApiProperty({ example: 'JUNE50', description: 'Discount code applied while purchase' })
  @IsNotEmpty()
  discount_code: string;

}
