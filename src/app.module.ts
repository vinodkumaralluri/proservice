import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalExceptionFilter } from './core/global-exception.filter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AutoIncrementModule } from './modules/auto-increment/auto-increment.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompanyModule } from './modules/company/company.module';
import { CustomerModule } from './modules/customer/customer.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { AddressModule } from './modules/address/address.module';
import { FactoryModule } from './modules/factory/factory.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { StoreModule } from './modules/store/store.module';
import { ServiceCenterModule } from './modules/service-center/service-center.module';
// import { DistributorModule } from './modules/distributor/distributor.module';
// import { RetailerModule } from './modules/retailer/retailer.module';
import { ProductModule } from './modules/product/product.module';
import { ModelModule } from './modules/model/model.module';
import { ItemModule } from './modules/item/item.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { WarrantyModule } from './modules/warranty/warranty.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ComplaintModule } from './modules/complaint/complaint.module';
import { TaskModule } from './modules/task/task.module';
import { ReviewModule } from './modules/review/review.module';
import { RatingModule } from './modules/rating/rating.module';
import { TransportModule } from './modules/transport/transport.module';
import { RoleModule } from './modules/role/role.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { LocationModule } from './modules/location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),  
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'item',
    }),
    AutoIncrementModule, 
    AdminModule,
    AuthModule,  
    UsersModule,  
    CompanyModule, 
    CustomerModule, 
    EmployeeModule, 
    AddressModule,
    FactoryModule, 
    WarehouseModule, 
    StoreModule,
    ServiceCenterModule,
    // DistributorModule, 
    // RetailerModule,
    ProductModule,
    ModelModule,
    ItemModule, 
    PurchaseModule, 
    WarrantyModule, 
    InventoryModule, 
    ComplaintModule,
    TaskModule,
    ReviewModule, 
    RatingModule,  
    TransportModule,
    RoleModule,
    AnnouncementsModule, 
    LocationModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    },
    AppService,
  ],
})
export class AppModule {}
