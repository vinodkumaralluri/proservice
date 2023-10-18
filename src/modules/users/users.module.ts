import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { AutoIncrementModule } from '../auto-increment/auto-increment.module';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { Employee, EmployeeSchema } from '../employee/schemas/employee.schema';
import { Customer, CustomerSchema } from '../customer/schemas/customer.schema';

@Global()
@Module({
  imports: [
    // AutoIncrementModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
