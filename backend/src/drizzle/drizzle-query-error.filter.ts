// src/drizzle/drizzle-query-error.filter.ts
import type { ExceptionFilter } from '@nestjs/common';
import { Catch, ConflictException, NotFoundException } from '@nestjs/common';
import { DrizzleQueryError } from 'drizzle-orm';

@Catch(DrizzleQueryError)
export class DrizzleQueryErrorFilter implements ExceptionFilter {
  catch(error: DrizzleQueryError) {
    // 👇 1
    if (!error.cause || !('code' in error.cause)) {
      throw new Error(error.message || 'Unknown database error');
    }

    // 👇 2
    const {
      cause: { code, message },
    } = error;

    // 👇 3
    switch (code) {
      case 'ER_DUP_ENTRY':
        if (message.includes('uniq_event_name')) {
          throw new ConflictException('An event with this name already exists');
        } else if (message.includes('uniq_user_email')) {
          throw new ConflictException(
            'There is already a user with this email address',
          );
        } else if (message.includes('uniq_wallet_per_customer_event')) {
          throw new ConflictException(
            'This user already has a wallet for this event',
          );
        } else {
          throw new ConflictException('This item already exists');
        }
      case 'ER_NO_REFERENCED_ROW_2':
        if (message.includes('transactions_vendorId')) {
          throw new NotFoundException('No vendor with this id exists');
        } else if (message.includes('transactions_eventId')) {
          throw new NotFoundException('No event with this id exists');
        } else if (message.includes('transactions_walletId')) {
          throw new NotFoundException('No wallet with this id exists');
        }
        break;
    }

    throw error;
  }
}
