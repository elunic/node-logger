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

  trace: (...msgs: Array<unknown>) => CustomWinstonLogger;
  debug: (...msgs: Array<unknown>) => CustomWinstonLogger;
  info: (...msgs: Array<unknown>) => CustomWinstonLogger;
  warn: (...msgs: Array<unknown>) => CustomWinstonLogger;
  error: (...msgs: Array<unknown>) => CustomWinstonLogger;
  fatal: (...msgs: Array<unknown>) => CustomWinstonLogger;
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
