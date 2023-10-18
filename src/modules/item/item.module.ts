// Modules
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { BullModule } from '@nestjs/bull';

// Schemas
import { Item, ItemSchema } from './schemas/item.schema';
import { ItemBlock, ItemBlockSchema } from './schemas/item-block.schema';
import { Inventory, InventorySchema } from '../inventory/schemas/inventory.schema';
import { ModelsSchema, Models } from '../model/schemas/model.schema';

// Controllers
import { ItemController } from './item.controller';

// Services
import { ItemService } from './item.service';

@Module({
  imports: [
    AutoIncrementModule,
    BullModule.registerQueue({
      name: 'item',
    }),
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: ItemBlock.name, schema: ItemBlockSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: Models.name, schema: ModelsSchema },
    ]),
  ],
  controllers: [ItemController],
  providers: [ItemService]
})
export class ItemModule {}
