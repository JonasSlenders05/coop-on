import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LoginRequestDto, LoginResponseDto } from './session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly authService: AuthService) {}

  @Post() // 👈 2
  async signIn(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const token = await this.authService.login(loginDto); // 👈 3
    return { token }; // 👈 4
  }
}
