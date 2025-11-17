import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { OrganiserService } from './organiser.service';
import {
  OrganiserListResponseDto,
  OrganiserResponseDto,
  UpdateOrganiserRequestDto,
} from './organiser.dto';
import { EventResponseDto } from 'src/event/event.dto';

@Controller('organisers')
export class OrganiserController {
  constructor(private readonly organiserService: OrganiserService) {}

  @Get()
  async getAllOrganisers(): Promise<OrganiserListResponseDto> {
    return this.organiserService.getAll();
  }

  @Get(':id')
  async getOrganiserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrganiserResponseDto> {
    return this.organiserService.getById(id);
  }

  @Put(':id')
  async updateOrganiser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateOrganiserDto: UpdateOrganiserRequestDto,
  ): Promise<OrganiserResponseDto> {
    return this.organiserService.updateById(userId, updateOrganiserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrganiser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.organiserService.deleteById(id);
  }

  @Get('/:id/events')
  async getEventsbyOrganiserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EventResponseDto[]> {
    return await this.organiserService.getEventsByOrganiserId(id);
  }
}
