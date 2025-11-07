import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EventService } from './event.service';
import {
  CreateEventRequestDto,
  EventListResponseDto,
  EventResponseDto,
  UpdateEventRequestDto,
} from './event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getAllEvents(): Promise<EventListResponseDto> {
    return this.eventService.getAll();
  }

  @Get(':id')
  getEventById(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventService.getById(Number(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createEvent(
    @Body() createEventDto: CreateEventRequestDto,
  ): Promise<EventResponseDto> {
    return this.eventService.create(createEventDto);
  }

  @Put(':id')
  updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventRequestDto,
  ): Promise<EventResponseDto> {
    return this.eventService.updateById(Number(id), updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEvent(@Param('id') id: string): Promise<void> {
    return this.eventService.deleteById(Number(id));
  }
}
