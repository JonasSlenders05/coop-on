export class CreateEventRequestDto {
  naam: string;
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
