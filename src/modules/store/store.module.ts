// Modules
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { InventoryModule } from '../inventory/inventory.module';

// Schemas
import { Store, StoreSchema } from './schemas/store.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';

// Controllers
import { StoreController } from './store.controller';

// Services
import { StoreService } from './store.service';


@Module({
  imports: [
    AutoIncrementModule,
    forwardRef(() => InventoryModule),
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
