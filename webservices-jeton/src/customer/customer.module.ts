import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { CustomerService } from './customer.service';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [DrizzleModule, WalletModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
