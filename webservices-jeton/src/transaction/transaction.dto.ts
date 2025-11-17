import { Type } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class CreateTransactionRequestDto {
  @IsNumber()
  walletId: number;

  @IsNumber()
  vendorId: number;

  @Type(() => Date)
  @IsDate()
  date?: Date = new Date();

  @IsNumber()
  amount: number;
}

export class UpdateTransactionRequestDto extends CreateTransactionRequestDto {}

export class TransactionResponseDto {
  @IsNumber()
  id: number;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNumber()
  amount: number;

  @IsNumber()
  walletId: number;

  @IsNumber()
  vendorId: number;
}

export class TransactionListResponseDto {
  items: TransactionResponseDto[];
}
