import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrganiserService } from './organiser.service';
import {
  OrganiserListResponseDto,
  OrganiserResponseDto,
} from './organiser.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PrivateRole } from '../auth/roles';
import { Roles } from '../auth/decorators/roles.decorator';
import { CheckUserAccessGuard } from '../auth/guards/userAcces.guard';
import { type Session } from '../types/auth';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { ParseUserIdPipe } from '../auth/pipes/parseUserId.pipe';

@ApiTags('Organisers')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Unauthorized - you need to be signed in',
})
@Controller('organisers')
export class OrganiserController {
  constructor(private readonly organiserService: OrganiserService) {}

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
  @UseGuards(CheckUserAccessGuard)
  async getOrganiserById(
    @Param('id', ParseUserIdPipe) id: number | 'me',
    @CurrentUser() user: Session,
  ): Promise<OrganiserResponseDto> {
    const userId = id === 'me' ? user.id : id;
    return this.organiserService.getById(userId);
  }

  // @Delete(':id')
  // @Roles(PrivateRole.ADMIN)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteOrganiser(@Param('id', ParseIntPipe) id: number): Promise<void> {
  //   return this.organiserService.deleteById(id);
  // }

  // @Get('/:id/events')
  // @Roles(PrivateRole.ADMIN, PublicRole.ORGANISER)
  // async getEventsbyOrganiserId(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<EventResponseDto[]> {
  //   return await this.organiserService.getEventsByOrganiserId(id);
  // }
}
