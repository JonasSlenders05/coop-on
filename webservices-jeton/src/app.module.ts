import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DrizzleModule } from './drizzle/drizzle.module';
import { EventModule } from './event/event.module';
import { HealthController } from './health/health.controller';
import { LoggerMiddleware } from './lib/logger.middleware';
import { WalletModule } from './wallet/wallet.module';
import { UserModule } from './user/user.module';
import { VendorModule } from './vendor/vendor.module';
import { TransactionModule } from './transaction/transaction.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { OrganiserModule } from './organiser/organiser.module';

@Module({
  imports: [
    EventModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DrizzleModule,
    WalletModule,
    UserModule,
    VendorModule,
    TransactionModule,
    AuthModule,
    SessionModule,
    OrganiserModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('path');
  }
}
