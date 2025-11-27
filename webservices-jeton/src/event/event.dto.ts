import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PublicWalletResponseDto } from 'src/wallet/wallet.dto';

export class CreateEventRequestDto {
  @ApiProperty({ example: 'Loon', description: 'Name of the event' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  location: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsNumber()
  organiserId: number;
}

export class UpdateEventRequestDto extends CreateEventRequestDto {}

export class EventResponseDto extends CreateEventRequestDto {
  id: number;
}

export class EventListResponseDto {
  @ApiProperty({ type: () => [EventResponseDto] })
  items: EventResponseDto[];
}

export class EventDetailResponseDto extends EventResponseDto {
  wallets: PublicWalletResponseDto[];
}
