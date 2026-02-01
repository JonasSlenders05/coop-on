// src/stripe/stripe.module.ts
import { Module, DynamicModule, Provider } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { STRIPE_OPTIONS } from './stripe.constants';

interface StripeModuleOptions {
  apiKey: string;
  webhookSecret: string;
}

@Module({})
export class StripeModule {
  /**
   * Register Stripe module synchronously
   */
  static forRoot(options: StripeModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: STRIPE_OPTIONS,
      useValue: options,
    };

    return {
      module: StripeModule,
      providers: [optionsProvider, StripeService],
      exports: [StripeService],
      global: true,
    };
  }

  /**
   * Register Stripe module asynchronously
   */
  static forRootAsync(options: {
    imports?: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<StripeModuleOptions> | StripeModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const optionsProvider: Provider = {
      provide: STRIPE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: StripeModule,
      imports: options.imports || [],
      providers: [optionsProvider, StripeService],
      exports: [StripeService],
      global: true,
    };
  }
}
