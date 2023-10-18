// Modules
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';

// Schemas
import { Warehouse, WarehouseSchema } from './schemas/warehouse.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';

// Controllers
import { WarehouseController } from './warehouse.controller';

// Services
import { WarehouseService } from './warehouse.service';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: Warehouse.name, schema: WarehouseSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService]
})
export class WarehouseModule {}
