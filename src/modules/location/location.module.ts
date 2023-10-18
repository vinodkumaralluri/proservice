// Modules
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';

// Schemas
import { Location, LocationSchema } from './schemas/location.schema';

// Controller
import { LocationController } from './location.controller';

// Service
import { LocationService } from './location.service';

@Module({
  imports: [
    AutoIncrementModule,
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
    ]),
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService]
})
export class LocationModule {}
