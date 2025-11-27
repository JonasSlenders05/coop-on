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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PrivateRole, PublicRole } from 'src/auth/roles';

@ApiTags('Events')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Unauthorized - you need to be signed in',
})
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiResponse({
    status: 200,
    description: 'Get all events',
    type: EventListResponseDto,
  })
  @Roles(PrivateRole.ADMIN)
  @Get()
  async getAllEvents(): Promise<EventListResponseDto> {
    return this.eventService.getAll();
  }

  @ApiResponse({
    status: 200,
    description: 'Get event by ID',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  @Roles(PrivateRole.ADMIN, PrivateRole.USER)
  @Get(':id')
  async getEventById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EventResponseDto> {
    return this.eventService.getById(id);
  }

  @ApiResponse({
    status: 201,
    description: 'Create event',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Body() createEventDto: CreateEventRequestDto,
  ): Promise<EventResponseDto> {
    return this.eventService.create(createEventDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Update event',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  @Put(':id')
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventRequestDto,
  ): Promise<EventResponseDto> {
    return this.eventService.updateById(id, updateEventDto);
  }

  @ApiResponse({
    status: 204,
    description: 'Event deleted',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.eventService.deleteById(id);
  }

  @ApiResponse({
    status: 200,
    description: 'Get wallets from event by eventID',
    type: [PublicWalletResponseDto],
  })
  @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  @Get('/:id/wallets')
  async getWalletsByEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PublicWalletResponseDto[]> {
    return await this.eventService.getWalletsByEvent(id);
  }
}
