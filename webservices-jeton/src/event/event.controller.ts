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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrivateRole, PublicRole } from '../auth/roles';
import { PublicUserResponseDto } from '../user/user.dto';
import { type Session } from '../types/auth';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';

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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - you need to be signed in',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  @Get()
  async getAllEvents(
    @CurrentUser() user: Session,
  ): Promise<EventListResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.eventService.getAll(user.id, roles);
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
  @Get(':id')
  async getEventById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Session,
  ): Promise<EventResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.eventService.getById(id, user.id, roles);
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
    @CurrentUser() user: Session,
    @Body() createEventDto: CreateEventRequestDto,
  ): Promise<EventResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];

    return this.eventService.create(user.id, createEventDto, roles);
  }

  @ApiResponse({
    status: 200,
    description: 'Update event by ID',
    type: PublicUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - you need to be signed in',
  })
  @ApiResponse({
    status: 403,
    description: 'You do not have access to this resource',
  })
  @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  @Put(':id')
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventRequestDto,
    @CurrentUser() user: Session,
  ): Promise<EventResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.eventService.updateById(id, updateEventDto, user.id, roles);
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
  async deleteEvent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Session,
  ): Promise<void> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.eventService.deleteById(id, user.id, roles);
  }

  // @ApiResponse({
  //   status: 200,
  //   description: 'Get wallets from event by eventID',
  //   type: [PublicWalletResponseDto],
  // })
  // @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  // @Get('/:id/wallets')
  // async getWalletsByEvent(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<PublicWalletResponseDto[]> {
  //   return await this.eventService.getWalletsByEvent(id);
  // }
}
