import { Expose, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTransactionRequestDto {
  @IsNumber()
  @IsNotEmpty()
  vendorId: number;

  @Type(() => Date)
  @IsDate()
  date?: Date = new Date();

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  walletId: number;
}

export class UpdateTransactionRequestDto extends CreateTransactionRequestDto {}

export class TransactionResponseDto {
  @Expose()
  id: number;
  @Expose()
  date: Date;
  @Expose()
  amount: number;
  @Expose()
  walletId: number;
  @Expose()
  vendorId: number;
  @Expose()
  eventId: number;
}

export class TransactionListResponseDto {
  items: TransactionResponseDto[];
}
