import * as winston from 'winston';

export enum LogLevels {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Fatal = 'fatal',
}

export interface Logger extends winston.Logger {
  namespace: string;

  trace: (...msgs: unknown[]) => Logger;
  debug: (...msgs: unknown[]) => Logger;
  info: (...msgs: unknown[]) => Logger;
  warn: (...msgs: unknown[]) => Logger;
  error: (...msgs: unknown[]) => Logger;
  fatal: (...msgs: unknown[]) => Logger;
}

export interface RootLogger extends Logger {
  createLogger: (childNamespace: string) => Logger;
}

export interface CreateRootLoggerOptions {
  consoleLevel: LogLevels;
  logPath?: string;
  loggerOptions?: winston.LoggerOptions;
}

export interface CreateChildLoggerOptions {
  loggerOptions?: winston.LoggerOptions;
}

/**
 * @deprecated
 */
export interface CustomRootWinstonLogger extends RootLogger {} // tslint:disable-line:no-empty-interface
/**
 * @deprecated
 */
export interface CustomWinstonLogger extends Logger {} // tslint:disable-line:no-empty-interface
/**
 * @deprecated
 */
export interface CreateLoggerOptions extends CreateRootLoggerOptions {} // tslint:disable-line:no-empty-interface
