import { LogLevel } from '@nestjs/common';

export default () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  log: process.env.LOG_LEVELS
    ? (JSON.parse(process.env.LOG_LEVELS) as LogLevel[])
    : ['log', 'error', 'warn'],
});

export interface ServerConfig {
  env: string;
  port: number;
  cors: CorsConfig;
  database: DatabaseConfig;
  log: LogConfig;
}

export interface DatabaseConfig {
  url: string;
}

export interface CorsConfig {
  origins: string[];
  maxAge: number;
}

export interface LogConfig {
  levels: LogLevel[];
}
