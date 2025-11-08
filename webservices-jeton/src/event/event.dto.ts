import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEventRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  naam: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  locatie: string;

  startDatum: Date;
  eindDatum: Date;
}

export class UpdateEventRequestDto extends CreateEventRequestDto {}

export class EventResponseDto extends CreateEventRequestDto {
  id: number;
}

export class EventListResponseDto {
  items: EventResponseDto[];
}
