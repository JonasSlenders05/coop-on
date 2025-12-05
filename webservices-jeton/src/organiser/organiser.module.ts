import { Module } from '@nestjs/common';
import { OrganiserController } from './organiser.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { OrganiserService } from './organiser.service';

@Module({
  imports: [DrizzleModule],
  controllers: [OrganiserController],
  providers: [OrganiserService],
  exports: [OrganiserService],
})
export class OrganiserModule {}
