import * as winston from 'winston';

import { Logger } from './logger';

export interface CustomWinstonLogger extends winston.Logger {
  trace: (...msgs: Array<unknown>) => CustomWinstonLogger;
  debug: (...msgs: Array<unknown>) => CustomWinstonLogger;
  info: (...msgs: Array<unknown>) => CustomWinstonLogger;
  warn: (...msgs: Array<unknown>) => CustomWinstonLogger;
  error: (...msgs: Array<unknown>) => CustomWinstonLogger;
  fatal: (...msgs: Array<unknown>) => CustomWinstonLogger;
}

export interface CreateLoggerOptions {
  consoleLevel: string;
  logPath?: string;
}

export type CreateChildLoggerFunction = (childNamespace: string) => Logger;