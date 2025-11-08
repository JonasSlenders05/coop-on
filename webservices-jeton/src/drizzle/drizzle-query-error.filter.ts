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
        if (message.includes('idx_place_name_unique')) {
          throw new ConflictException('A place with this name already exists');
        } else if (message.includes('idx_user_email_unique')) {
          throw new ConflictException(
            'There is already a user with this email address',
          );
        } else {
          throw new ConflictException('This item already exists');
        }
      case 'ER_NO_REFERENCED_ROW_2':
        if (message.includes('transactions_user_id')) {
          throw new NotFoundException('No user with this id exists');
        } else if (message.includes('transactions_place_id')) {
          throw new NotFoundException('No place with this id exists');
        }
        break;
    }

    throw error;
  }
}
