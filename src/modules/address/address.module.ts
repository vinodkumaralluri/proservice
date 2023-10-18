import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import { Address, AddressSchema } from './schemas/address.schema';

// Controller
import { AddressController } from './address.controller';

// Service
import { AddressService } from './address.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Address.name, schema: AddressSchema },
    ]),
  ],
  controllers: [AddressController],
  providers: [AddressService]
})
export class AddressModule {}
