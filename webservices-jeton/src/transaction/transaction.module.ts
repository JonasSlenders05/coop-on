import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { TransactionService } from './transaction.service';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [DrizzleModule],
  controllers: [TransactionController],
  providers: [TransactionService, UserService],
  exports: [TransactionService, UserService],
})
export class TransactionModule {}
