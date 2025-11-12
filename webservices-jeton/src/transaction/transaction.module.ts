import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { TransactionService } from './transaction.service';

@Module({
  imports: [DrizzleModule],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
