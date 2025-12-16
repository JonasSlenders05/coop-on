import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { EventResponseDto } from '../event/event.dto';
import { PublicUserResponseDto } from '../user/user.dto';
import { IsNumber, IsBoolean } from 'nestjs-swagger-dto';
import { ApiProperty } from '@nestjs/swagger';

export class PublicWalletResponseDto {
  @ApiProperty({
    description: 'The unique ID of the wallet',
    example: 21,
    format: 'int32',
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Current value of the wallet',
    example: 5,
    format: 'int32',
  })
  @Expose()
  value: number;

  @ApiProperty({
    description:
      'Status indicating if the wallet is currently active (true) or suspended (false)',
    example: true,
  })
  @Expose()
  active: boolean;

  @ApiProperty({
    description: 'Timestamp when the wallet was created',
    example: '2025-10-20T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'The ID of the event this wallet is associated with',
    example: 1,
    format: 'int32',
  })
  @Expose()
  eventId: number;

  @ApiProperty({
    description: 'Detailes of the event from this wallet',
    type: () => EventResponseDto,
  })
  @Expose()
  @Type(() => EventResponseDto)
  event: EventResponseDto;

  @ApiProperty({
    description: 'The ID of the user who owns this wallet',
    example: 42,
    format: 'int32',
  })
  @Expose()
  userId: number;

  @ApiProperty({
    description: 'Details of the user who owns the wallet',
    type: () => PublicUserResponseDto,
  })
  @Expose()
  @Type(() => PublicUserResponseDto)
  user: PublicUserResponseDto;
}

export class WalletListResponseDto {
  @ApiProperty({ type: () => [PublicWalletResponseDto] })
  items: PublicWalletResponseDto[];
}

export class CreateWalletRequestDto {
  @IsNumber({
    name: 'eventId',
    description: 'ID of the event the wallet belongs to',
  })
  @IsNotEmpty()
  eventId: number;

  @IsNumber({
    name: 'value',
    description: 'Starting value of the wallet (defaults to 0)',
  })
  @IsNotEmpty()
  value?: number = 0;

  @IsBoolean({
    name: 'active',
    description: 'Is the wallet active?',
  })
  @IsNotEmpty()
  active: boolean;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Creation date of the wallet (defaults to now)',
  })
  @Type(() => Date)
  @IsDate()
  createdAt?: Date = new Date();
}

export class UpdateWalletRequestDto {
  @IsNumber({
    name: 'value',
    description: 'Increase wallet value',
  })
  @IsOptional()
  value?: number = 0;

  @IsBoolean({
    name: 'active',
    description: 'Is the wallet active?',
  })
  @IsOptional()
  active?: boolean;
}
