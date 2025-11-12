import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { WalletResponseDto } from 'src/wallet/wallet.dto';

export class CreateEventRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  startDate: Date;
  endDate: Date;
}

export class UpdateEventRequestDto extends CreateEventRequestDto {}

export class EventResponseDto extends CreateEventRequestDto {
  id: number;
}

export class EventListResponseDto {
  items: EventResponseDto[];
}

export class EventDetailResponseDto extends EventResponseDto {
  wallets: WalletResponseDto[];
}
