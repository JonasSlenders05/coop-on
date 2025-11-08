import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LogConfig, ServerConfig } from './config/configuration';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import CustomLogger from './core/custumLogger';
import { HttpExceptionFilter } from './lib/http-exception.filter';
import { DrizzleQueryErrorFilter } from './drizzle/drizzle-query-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[] = []) => {
        const formattedErrors = errors.reduce(
          (acc, err) => {
            acc[err.property] = Object.values(err.constraints || {});
            return acc;
          },
          {} as Record<string, string[]>,
        );

        return new BadRequestException({
          details: { body: formattedErrors },
        });
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalFilters(new DrizzleQueryErrorFilter());

  const config = app.get(ConfigService<ServerConfig>);
  const port = config.get<number>('port')!;
  const log = config.get<LogConfig>('log')!;

  app.useLogger(
    new CustomLogger({
      logLevels: log.levels,
    }),
  );

  await app.listen(port);
}
bootstrap();
