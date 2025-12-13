import { Expose, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PublicVendorResponseDto } from '../vendor/vendor.dto';

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

export class UpdateTransactionRequestDto {
  @IsNumber()
  @IsOptional()
  vendorId: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date = new Date();

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  amount: number;

  @IsNumber()
  @IsOptional()
  walletId: number;
}

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

  @Expose()
  @Type(() => PublicVendorResponseDto)
  vendor: PublicVendorResponseDto;
}

export class TransactionListResponseDto {
  items: TransactionResponseDto[];
}
