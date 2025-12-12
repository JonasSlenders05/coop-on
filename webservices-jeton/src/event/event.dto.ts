import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PublicWalletResponseDto } from '../wallet/wallet.dto';
import { OrganiserResponseDto } from '../organiser/organiser.dto';

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
}

export class UpdateEventRequestDto {
  @ApiProperty({ example: 'Loon', description: 'Name of the event' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @IsOptional()
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @IsOptional()
  location: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate: Date;
}

export class EventResponseDto {
  @Expose()
  id: number;
  @Expose()
  organiserId: number;
  @Expose()
  name: string;
  @Expose()
  location: string;
  @Expose()
  startDate: Date;
  @Expose()
  endDate: Date;
  @Expose()
  organiser: OrganiserResponseDto;
}

export class EventListResponseDto {
  items: EventResponseDto[];
}

export class EventDetailResponseDto extends EventResponseDto {
  wallets: PublicWalletResponseDto[];
}
