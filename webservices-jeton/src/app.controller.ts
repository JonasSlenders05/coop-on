import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'Coop-on API is running! 🚀 Ga naar /api/docs voor documentatie.';
  }
}
