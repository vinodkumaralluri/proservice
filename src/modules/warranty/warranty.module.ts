import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { WarrantyController } from './warranty.controller';
import { WarrantyService } from './warranty.service';
import { Warranty, WarrantySchema } from './schemas/warranty.schema';
import { Claim, ClaimSchema } from './schemas/claims.schema';
import { Item, ItemSchema } from '../item/schemas/item.schema';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: Warranty.name, schema: WarrantySchema },
      { name: Claim.name, schema: ClaimSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
  ],
  controllers: [WarrantyController],
  providers: [WarrantyService]
})
export class WarrantyModule {}
