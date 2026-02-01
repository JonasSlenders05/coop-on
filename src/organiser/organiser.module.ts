import { Module } from '@nestjs/common';
import { OrganiserController } from './organiser.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { OrganiserService } from './organiser.service';
import { EventModule } from '../event/event.module';

@Module({
  imports: [DrizzleModule, EventModule],
  controllers: [OrganiserController],
  providers: [OrganiserService],
  exports: [OrganiserService],
})
export class OrganiserModule {}
