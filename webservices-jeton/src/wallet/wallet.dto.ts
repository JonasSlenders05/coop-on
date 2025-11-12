import { IsBoolean, IsDate, IsInt } from 'class-validator';
import { PublicCustomerDto } from 'src/customer/customer.dto';
import { EventResponseDto } from 'src/event/event.dto';
import { Type } from 'class-transformer';

export class PublicWalletDto {
  id: number;
  value: number;
  state: boolean;
  createdAt: Date;
  customerId: number;
  eventId: number;
}

export class WalletListResponseDto {
  items: WalletResponseDto[];
}

export class WalletResponseDto {
  id: number;
  value: number;
  state: boolean;
  createdAt: Date;
  customer: PublicCustomerDto;
  event: EventResponseDto;
}

export class CreateWalletRequestDto {
  @IsInt()
  customerId: number;

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

export class UpdateWalletRequestDto extends CreateWalletRequestDto {}
