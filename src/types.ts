import * as winston from 'winston';

export enum LogLevels {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Fatal = 'fatal',
}

export interface CustomWinstonLogger extends winston.Logger {
  namespace: string;

  trace: (...msgs: unknown[]) => CustomWinstonLogger;
  debug: (...msgs: unknown[]) => CustomWinstonLogger;
  info: (...msgs: unknown[]) => CustomWinstonLogger;
  warn: (...msgs: unknown[]) => CustomWinstonLogger;
  error: (...msgs: unknown[]) => CustomWinstonLogger;
  fatal: (...msgs: unknown[]) => CustomWinstonLogger;
}

export interface CustomRootWinstonLogger extends CustomWinstonLogger {
  createLogger: (childNamespace: string) => CustomWinstonLogger;
}

export interface CreateLoggerOptions {
  consoleLevel: LogLevels;
  logPath?: string;
  loggerOptions?: winston.LoggerOptions;
}

export interface CreateChildLoggerOptions {
  loggerOptions?: winston.LoggerOptions;
}
