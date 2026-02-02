// src/lib/logger.middleware.ts
import type { NestMiddleware } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable() // 👈 👇 1
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name); // 👈 2

  // 👇 3
  use(req: Request, res: Response, next: NextFunction) {
    // 👇 4
    res.on('finish', () => {
      // 👇 5
      const statusCode = res.statusCode;

      const message = `${req.method} ${req.originalUrl} - ${statusCode}`;

      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next(); // 👈 6
  }
}
