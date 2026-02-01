import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Get('ping')
  @Public()
  ping(): { pong: boolean } {
    return { pong: true };
  }
}
