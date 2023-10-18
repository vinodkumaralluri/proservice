// Modules
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { BullModule } from '@nestjs/bull';
import { LocationModule } from '../location/location.module';
import { CustomerModule } from '../customer/customer.module';

// Schemas
import { Trip, TripSchema } from './schemas/trip.schema';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { Delivery, DeliverySchema } from './schemas/delivery.schema';
import { Pickup, PickupSchema } from './schemas/pickup.schema';
import { Item, ItemSchema } from '../item/schemas/item.schema';
import { Purchase, PurchaseSchema } from '../purchase/schemas/purchase.schema';

// Controllers
import { TripController } from './trip/trip.controller';
import { DeliveryController } from './delivery/delivery.controller';
import { PickupController } from './pickup/pickup.controller';
import { VehicleController } from './vehicle/vehicle.controller';

// Services
import { TripService } from './trip/trip.service';
import { DeliveryService } from './delivery/delivery.service';
import { PickupService } from './pickup/pickup.service';
import { VehicleService } from './vehicle/vehicle.service';

@Module({  imports: [
  AutoIncrementModule,
  LocationModule,
  CustomerModule,
  BullModule.registerQueue({
    name: 'item',
  }),
  MongooseModule.forFeature([
    { name: Trip.name, schema: TripSchema },
    { name: Vehicle.name, schema: VehicleSchema },
    { name: Delivery.name, schema: DeliverySchema },
    { name: Pickup.name, schema: PickupSchema },
    { name: Item.name, schema: ItemSchema },
    { name: Purchase.name, schema: PurchaseSchema },
  ]),
],
  controllers: [
    TripController, 
    DeliveryController, 
    PickupController, 
    VehicleController
  ],
  providers: [
    TripService, 
    DeliveryService, 
    PickupService, 
    VehicleService
  ]
})
export class TransportModule {}