import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { EventResponseDto } from 'src/event/event.dto';
import { PublicUserResponseDto } from 'src/user/user.dto';

export class PublicWalletResponseDto {
  @Expose()
  id: number;

  value: number;

  @Expose()
  active: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  userId: number;

  @Expose()
  eventId: number;

  @Expose()
  @Type(() => EventResponseDto)
  event: EventResponseDto;

  @Expose()
  @Type(() => PublicUserResponseDto)
  user: PublicUserResponseDto;
}

export class WalletListResponseDto {
  items: PublicWalletResponseDto[];
}

export class CreateWalletRequestDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsNumber()
  @IsNotEmpty()
  value?: number = 0;

  @IsBoolean()
  @IsNotEmpty()
  active: boolean;

  @Type(() => Date)
  @IsDate()
  createdAt?: Date = new Date();
}

export class UpdateWalletRequestDto {
  @IsOptional()
  @IsNumber()
  value?: number = 0;

  @IsOptional()
  @IsBoolean()
  active: boolean;
}
