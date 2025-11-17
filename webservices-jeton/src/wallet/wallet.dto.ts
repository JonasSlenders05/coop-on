import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class PublicWalletResponseDto {
  @Expose()
  id: number;

  @IsNumber()
  value: number;

  @Expose()
  @IsBoolean()
  state: boolean;

  @Expose()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsNumber()
  userId: number;

  @Expose()
  @IsNumber()
  eventId: number;
}

export class WalletListResponseDto {
  items: PublicWalletResponseDto[];
}

export class CreateWalletRequestDto {
  @IsInt()
  userId: number;

  @IsInt()
  eventId: number;

  @IsInt()
  value?: number = 0;

  @IsBoolean()
  state: boolean;

  @Type(() => Date)
  @IsDate()
  createdAt?: Date = new Date();
}

export class UpdateWalletRequestDto {
  @IsOptional()
  @IsInt()
  value?: number = 0;

  @IsOptional()
  @IsBoolean()
  state: boolean;
}
