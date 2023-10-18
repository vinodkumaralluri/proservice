import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Models, ModelsSchema } from '../model/schemas/model.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';
import { Store, StoreSchema } from '../store/schemas/store.schema';
import { ServiceCenter, ServiceCenterSchema } from '../service-center/schemas/service-center.schema';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Models.name, schema: ModelsSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Store.name, schema: StoreSchema },
      { name: ServiceCenter.name, schema: ServiceCenterSchema },
    ]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService]
})
export class ReviewModule {}
