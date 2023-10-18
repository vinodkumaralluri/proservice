import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { Rating, RatingSchema } from './schemas/rating.schema';
import { Models, ModelsSchema } from '../model/schemas/model.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';
import { Store, StoreSchema } from '../store/schemas/store.schema';
import { ServiceCenter, ServiceCenterSchema } from '../service-center/schemas/service-center.schema';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: Models.name, schema: ModelsSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Store.name, schema: StoreSchema },
      { name: ServiceCenter.name, schema: ServiceCenterSchema },
    ]),
  ],
  controllers: [RatingController],
  providers: [RatingService]
})
export class RatingModule {}
