import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { PublicWalletResponseDto } from 'src/wallet/wallet.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getAllEvents(): Promise<EventListResponseDto> {
    return this.eventService.getAll();
  }

  @Get(':id')
  async getEventById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EventResponseDto> {
    return this.eventService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Body() createEventDto: CreateEventRequestDto,
  ): Promise<EventResponseDto> {
    return this.eventService.create(createEventDto);
  }

  @Put(':id')
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventRequestDto,
  ): Promise<EventResponseDto> {
    return this.eventService.updateById(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.eventService.deleteById(id);
  }

  @Get('/:id/wallets')
  async getWalletsByEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PublicWalletResponseDto[]> {
    return await this.eventService.getWalletsByEvent(id);
  }
}
