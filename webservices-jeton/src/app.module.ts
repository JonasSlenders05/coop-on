import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DrizzleModule } from './drizzle/drizzle.module';
import { EventModule } from './event/event.module';
import { HealthController } from './health/health.controller';
import { LoggerMiddleware } from './lib/logger.middleware';

@Module({
  imports: [
    EventModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DrizzleModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('path');
  }
}
