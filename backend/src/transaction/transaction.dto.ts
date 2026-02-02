import { Expose, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { PublicVendorResponseDto } from '../vendor/vendor.dto';
import { IsNumber } from 'nestjs-swagger-dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionRequestDto {
  @IsNumber({
    name: 'vendorId',
    description: 'ID of the vendor for this transaction',
    example: 1,
  })
  @IsNotEmpty()
  vendorId: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Date of the transaction (defaults to now)',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  date?: Date = new Date();

  @IsNumber({
    name: 'amount',
    description: 'Amount of the transaction',
    example: 15,
  })
  @IsNotEmpty()
  amount: number;

  @IsNumber({
    name: 'walletId',
    description: 'ID of the wallet used for the transaction',
    example: 1,
  })
  walletId: number;
}

export class UpdateTransactionRequestDto {
  @IsNumber({
    name: 'vendorId',
    description: 'ID of the vendor for this transaction',
  })
  @IsOptional()
  vendorId?: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Date of the transaction',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date = new Date();

  @IsOptional()
  @IsNumber({
    name: 'amount',
    description: 'Amount of the transaction',
  })
  @IsNotEmpty()
  amount?: number;

  @IsOptional()
  @IsNumber({
    name: 'walletId',
    description: 'ID of the wallet used for the transaction',
  })
  walletId?: number;
}

export class TransactionResponseDto {
  @ApiProperty({
    name: 'transactionId',
    description: 'ID of the transaction',
  })
  @IsNotEmpty()
  @Expose()
  id: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Date of the transaction',
  })
  @Type(() => Date)
  @IsDate()
  @Expose()
  date: Date;

  @ApiProperty({
    name: 'amount',
    description: 'Amount of the transaction',
  })
  @Expose()
  amount: number;

  @ApiProperty({
    name: 'walletId',
    description: 'Wallet used for the transaction',
  })
  @Expose()
  walletId: number;

  @ApiProperty({
    name: 'vendorId',
    description: 'ID of the vendor for this transaction',
  })
  @Expose()
  vendorId: number;

  @ApiProperty({
    name: 'eventId',
    description: 'ID of the event where this transaction was made',
  })
  @Expose()
  eventId: number;

  @ApiProperty({
    description: 'The details of the vendor for this transaction',
    type: () => PublicVendorResponseDto,
  })
  @Expose()
  @Type(() => PublicVendorResponseDto)
  vendor: PublicVendorResponseDto;
}

export class TransactionListResponseDto {
  @ApiProperty({ type: () => [TransactionResponseDto] })
  items: TransactionResponseDto[];
}
