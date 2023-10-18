import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { ServiceCenterController } from './service-center.controller';
import { ServiceCenterService } from './service-center.service';
import { ServiceCenter, ServiceCenterSchema } from './schemas/service-center.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: ServiceCenter.name, schema: ServiceCenterSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [ServiceCenterController],
  providers: [ServiceCenterService]
})
export class ServiceCenterModule {}
