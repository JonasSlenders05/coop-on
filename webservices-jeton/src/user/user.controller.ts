import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import {
  PublicUserResponseDto,
  RegisterUserRequestDto,
  UpdateUserRequestDto,
  UserListResponseDto,
} from './user.dto';
import { UserService } from './user.service';
import { PublicVendorResponseDto } from 'src/vendor/vendor.dto';
import { LoginResponseDto } from 'src/session/session.dto';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getAllUsers(): Promise<UserListResponseDto> {
    return this.userService.getAll();
  }

  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PublicUserResponseDto> {
    return this.userService.getById(id);
  }

  @Put(':id')
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<PublicUserResponseDto> {
    return this.userService.updateById(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.deleteById(id);
  }

  @Get('/:id/vendors')
  async getVendorByUserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PublicVendorResponseDto> {
    return this.userService.getVendorByUserId(id);
  }

  @Post()
  async registerUser(
    @Body() registerDto: RegisterUserRequestDto,
  ): Promise<LoginResponseDto> {
    const token = await this.authService.register(registerDto);
    return { token };
  }
}
