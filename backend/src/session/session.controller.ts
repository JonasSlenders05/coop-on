import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginRequestDto, LoginResponseDto } from './session.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthDelayInterceptor } from '../auth/interceptors/authDelay.interceptor';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionController {
  constructor(private authService: AuthService) {}

  @ApiResponse({
    status: 200,
    description: 'Login',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @Post()
  @Public()
  @UseInterceptors(AuthDelayInterceptor)
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const token = await this.authService.login(loginDto);
    return { token };
  }
}
