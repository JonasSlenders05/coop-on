import { Expose, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateTransactionRequestDto {
  @IsNumber()
  @IsNotEmpty()
  walletId: number;

  @IsNumber()
  @IsNotEmpty()
  vendorId: number;

  @Type(() => Date)
  @IsDate()
  date?: Date = new Date();

  @IsNumber()
  @IsNotEmpty()
  @Min(0.00001)
  amount: number;
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
}

export class TransactionListResponseDto {
  items: TransactionResponseDto[];
}
