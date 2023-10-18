import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { ComplaintController } from './complaint.controller';
import { ComplaintService } from './complaint.service';
import { Complaint, ComplaintSchema } from './schemas/complaint.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';
import { Models, ModelsSchema } from '../model/schemas/model.schema';
import { Item, ItemSchema } from '../item/schemas/item.schema';
import { ServiceCenter, ServiceCenterSchema } from '../service-center/schemas/service-center.schema';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: Complaint.name, schema: ComplaintSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Models.name, schema: ModelsSchema },
      { name: Item.name, schema: ItemSchema },
      { name: ServiceCenter.name, schema: ServiceCenterSchema },
    ]),
  ],
  controllers: [ComplaintController],
  providers: [ComplaintService]
})
export class ComplaintModule {}
