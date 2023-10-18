// Modules
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';

// Schemas
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { Item, ItemSchema } from '../item/schemas/item.schema';

// Controllers
import { PurchaseController } from './purchase.controller';

// Services
import { PurchaseService } from './purchase.service';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService]
})
export class PurchaseModule {}
