import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    AutoIncrementModule,
    RoleModule,
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
