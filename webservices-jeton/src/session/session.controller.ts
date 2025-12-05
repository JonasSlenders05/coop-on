import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginRequestDto, LoginResponseDto } from './session.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionController {
  constructor(private readonly authService: AuthService) {}

  // @ApiResponse({
  //   status: 200,
  //   description: 'Login',
  //   type: LoginResponseDto,
  // })
  // @ApiResponse({
  //   status: 401,
  //   description: 'Invalid credentials',
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid input data',
  // })
  // @UseInterceptors(AuthDelayInterceptor)
  @Post()
  @Public()
  async signIn(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const token = await this.authService.login(loginDto);
    return { token };
  }
}
