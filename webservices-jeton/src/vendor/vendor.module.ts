import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { VendorService } from './vendor.service';

@Module({
  imports: [DrizzleModule],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService],
})
export class VendorModule {}
