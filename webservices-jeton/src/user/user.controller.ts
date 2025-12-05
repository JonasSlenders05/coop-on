import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  PublicUserResponseDto,
  RegisterUserRequestDto,
  UpdateUserRequestDto,
  UserListResponseDto,
} from './user.dto';
import { UserService } from './user.service';
import { LoginResponseDto } from '../session/session.dto';
import { AuthService } from '../auth/auth.service';
import { CheckUserAccessGuard } from '../auth/guards/userAcces.guard';
import { type Session } from '../types/auth';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { PublicWalletResponseDto } from '../wallet/wallet.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrivateRole } from '../auth/roles';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { AuthDelayInterceptor } from '../auth/interceptors/authDelay.interceptor';
import { ParseUserIdPipe } from '../auth/pipes/parseUserId.pipe';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  //Get users
  @ApiResponse({
    status: 200,
    description: 'Get all users',
    type: UserListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @Get()
  @Roles(PrivateRole.ADMIN)
  async getAllUsers(): Promise<UserListResponseDto> {
    return this.userService.getAll();
  }

  //Get user by ID
  @ApiResponse({
    status: 200,
    description: 'Get user by ID',
    type: PublicUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
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
  async getUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number,
    @CurrentUser() user: Session,
  ): Promise<PublicUserResponseDto> {
    const userId = id === 'me' ? user.id : id; // 👈
    return await this.userService.getById(userId);
  }

  // Registreer user
  @ApiResponse({
    status: 200,
    description: 'Register',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @Post()
  @Public()
  @UseInterceptors(AuthDelayInterceptor)
  async registerUser(
    @Body() registerDto: RegisterUserRequestDto,
  ): Promise<LoginResponseDto> {
    const token = await this.authService.register(registerDto);
    return { token };
  }

  //Update user by ID
  @ApiResponse({
    status: 200,
    description: 'Update user by ID',
    type: PublicUserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
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
  @Put(':id')
  @UseGuards(CheckUserAccessGuard)
  async updateUserById(
    @Param('id', ParseUserIdPipe) id: number | 'me',
    @CurrentUser() user: Session,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<PublicUserResponseDto> {
    const userId = id === 'me' ? user.id : id;
    return this.userService.updateById(userId, dto);
  }

  //Delete user by ID
  @ApiResponse({
    status: 204,
    description: 'Delete user',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - you need to be sigend in',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'me',
  })
  @Delete(':id')
  @UseGuards(CheckUserAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(
    @Param('id', ParseUserIdPipe) id: 'me' | number,
    @CurrentUser() user: Session,
  ): Promise<void> {
    return this.userService.deleteById(id === 'me' ? user.id : id);
  }

  @ApiResponse({
    status: 200,
    description: 'Get wallets owned by a user',
    type: PublicWalletResponseDto,
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
  @Get('/:id/wallets')
  async getWalletsByUserId(
    @Param('id', ParseUserIdPipe) id: 'me' | number,
    @CurrentUser() user: Session,
  ): Promise<PublicWalletResponseDto[]> {
    return this.userService.getWalletsByUserId(id === 'me' ? user.id : id);
  }

  // @Get('/:id/vendors')
  // async getVendorByUserId(
  //   @Param('id', ParseUserIdPipe) id: number,
  // ): Promise<PublicVendorResponseDto> {
  //   return this.userService.getVendorByUserId(id);
  // }

  // @Get('/:id/organisers')
  // async getOrganiserByUserId(
  //   @Param('id', ParseUserIdPipe) id: number,
  // ): Promise<OrganiserResponseDto> {
  //   return this.userService.getOrganiserByUserId(id);
  // }
}
