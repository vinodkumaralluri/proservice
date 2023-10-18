// Modules
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { InventoryModule } from '../inventory/inventory.module';

// Schemas
import { Factory, FactorySchema } from './schemas/factory.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';

// Controllers
import { FactoryController } from './factory.controller';

// Services
import { FactoryService } from './factory.service';

@Module({
  imports: [
    AutoIncrementModule,
    InventoryModule,
    MongooseModule.forFeature([
      { name: Factory.name, schema: FactorySchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [FactoryController],
  providers: [FactoryService],
  exports: [FactoryService]
})
export class FactoryModule {}
