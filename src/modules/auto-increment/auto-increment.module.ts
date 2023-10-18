import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoIncrement, AutoIncrementSchema } from './auto-increment.schema';
import { AutoIncrementService } from './auto-increment.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AutoIncrement.name, schema: AutoIncrementSchema },
    ]),
  ],
  controllers: [],
  providers: [AutoIncrementService],
  exports: [AutoIncrementService]
})
export class AutoIncrementModule {}
