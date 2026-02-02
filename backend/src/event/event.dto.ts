import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { PublicWalletResponseDto } from '../wallet/wallet.dto';
import { OrganiserResponseDto } from '../organiser/organiser.dto';
import { IsString } from 'nestjs-swagger-dto';

export class CreateEventRequestDto {
  @IsString({
    name: 'name',
    example: 'Gentse Feesten',
    description: 'Name of the event',
    minLength: 2,
    maxLength: 255,
  })
  name: string;

  @IsString({
    name: 'location',
    example: 'Ghent, Belgium',
    description: 'Location of the event',
    minLength: 2,
    maxLength: 255,
  })
  location: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Start date and time of the event',
  })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'End date and time of the event',
  })
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

export class UpdateEventRequestDto {
  @IsString({
    name: 'name',
    description: 'Name of the event',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  name?: string;

  @IsString({
    name: 'location',
    description: 'Location of the event',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  location?: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Start date and time of the event',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'End date and time of the event',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;
}

export class EventResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique ID of the event',
    format: 'int32',
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 101,
    description: 'ID of the organiser who created this event',
    format: 'int32',
  })
  @Expose()
  organiserId: number;

  @ApiProperty({
    example: 'Gentse Feesten',
    description: 'Name of the event',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'Ghent, Belgium',
    description: 'Physical location of the event',
  })
  @Expose()
  location: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Start date and time of the event',
    example: '2026-07-19T10:00:00Z',
  })
  @Expose()
  startDate: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'End date and time of the event',
    example: '2026-07-28T23:59:59Z',
  })
  @Expose()
  endDate: Date;

  @ApiProperty({
    description: 'Details about the organiser of the event',
    type: () => OrganiserResponseDto,
  })
  @Expose()
  @Type(() => OrganiserResponseDto)
  organiser: OrganiserResponseDto;
}

export class EventListResponseDto {
  @ApiProperty({ type: () => [EventResponseDto] })
  items: EventResponseDto[];
}

export class EventDetailResponseDto extends EventResponseDto {
  @ApiProperty({ type: () => [PublicWalletResponseDto] })
  wallets: PublicWalletResponseDto[];
}
