import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { OrganiserService } from './organiser.service';
import {
  OrganiserListResponseDto,
  OrganiserResponseDto,
  UpdateOrganiserRequestDto,
} from './organiser.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PrivateRole, PublicRole } from '../auth/roles';
import { Roles } from '../auth/decorators/roles.decorator';
import { type Session } from '../types/auth';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { ParseUserIdPipe } from '../auth/pipes/parseUserId.pipe';
import { EventResponseDto } from '../event/event.dto';
import { EventService } from '../event/event.service';

@ApiTags('Organisers')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Unauthorized - you need to be signed in',
})
@Controller('organisers')
export class OrganiserController {
  constructor(
    private readonly organiserService: OrganiserService,
    private readonly eventService: EventService,
  ) {}

  //get All
  @ApiResponse({
    status: 200,
    description: 'Get all organisers',
    type: OrganiserListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - you need to be signed in',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @Get()
  @Roles(PrivateRole.ADMIN)
  async getAllOrganisers(): Promise<OrganiserListResponseDto> {
    return this.organiserService.getAll();
  }

  //get by ID
  @ApiResponse({
    status: 200,
    description: 'Get organiser by ID',
    type: OrganiserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organiser not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - you need to be signed in',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'me',
  })
  @Get(':id')
  @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  async getOrganiserById(
    @Param('id', ParseUserIdPipe) id: number | 'me',
    @CurrentUser() user: Session,
  ): Promise<OrganiserResponseDto> {
    const roles = [...user.privateRoles, ...user.publicRoles];
    const userId = id === 'me' ? user.id : id;
    return this.organiserService.getById(user.id, userId, roles);
  }

  // @Delete(':id')
  // @Roles(PrivateRole.ADMIN)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteOrganiser(@Param('id', ParseIntPipe) id: number): Promise<void> {
  //   return this.organiserService.deleteById(id);
  // }

  @Put(':id')
  @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  async updateOrganisersById(
    @Param('id', ParseUserIdPipe) id: number | 'me',
    @Body() updateOrganiserDto: UpdateOrganiserRequestDto,
    @CurrentUser() user: Session,
  ): Promise<OrganiserResponseDto> {
    const organiserId = id === 'me' ? user.id : id;
    const roles = [...user.privateRoles, ...user.publicRoles];
    return this.organiserService.updateById(
      user.id,
      organiserId,
      updateOrganiserDto,
      roles,
    );
  }

  @Get('/:id/events')
  @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  async getEventsbyOrganiserId(
    @Param('id', ParseUserIdPipe) id: number | 'me',
    @CurrentUser() user: Session,
  ): Promise<EventResponseDto[]> {
    const organiserId = id === 'me' ? user.id : id;
    const roles = [...user.privateRoles, ...user.publicRoles];
    await this.organiserService.getById(user.id, organiserId, roles);
    return await this.eventService.getEventsByOrganiserId(
      user.id,
      organiserId,
      roles,
    );
  }
}
