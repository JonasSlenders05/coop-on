import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Get('ping')
  @Public()
  ping(): string {
    return 'pong';
  }
}
