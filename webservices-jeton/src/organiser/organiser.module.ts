import { Module } from '@nestjs/common';
import { OrganiserController } from './organiser.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { OrganiserService } from './organiser.service';
import { EventService } from '../event/event.service';

@Module({
  imports: [DrizzleModule],
  controllers: [OrganiserController],
  providers: [OrganiserService, EventService],
  exports: [OrganiserService, EventService],
})
export class OrganiserModule {}
