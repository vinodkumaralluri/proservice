import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';
import { Models, ModelsSchema } from './schemas/model.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: Models.name, schema: ModelsSchema },
      { name: Company.name, schema: CompanySchema},
    ]),
  ],
  controllers: [ModelController],
  providers: [ModelService]
})
export class ModelModule {}
