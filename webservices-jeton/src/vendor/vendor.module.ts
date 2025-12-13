import { forwardRef, Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { VendorService } from './vendor.service';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [DrizzleModule, forwardRef(() => TransactionModule)],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService],
})
export class VendorModule {}
