// Modules
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { BullModule } from '@nestjs/bull';

// Schemas
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { Models, ModelsSchema } from '../model/schemas/model.schema';
import { Store, StoreSchema } from '../store/schemas/store.schema';
import { Item, ItemSchema } from '../item/schemas/item.schema';
import { Factory, FactorySchema } from '../factory/schemas/factory.schema';

// Controllers
import { InventoryController } from './inventory.controller';

// Services
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    AutoIncrementModule,
    BullModule.registerQueue({
      name: 'item',
    }),
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
      { name: Models.name, schema: ModelsSchema },
      { name: Store.name, schema: StoreSchema },
      { name: Item.name, schema: ItemSchema },
      { name: Factory.name, schema: FactorySchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService]
})
export class InventoryModule {}
