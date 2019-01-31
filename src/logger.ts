import * as winston from 'winston';

import { CreateChildLoggerFunction, CustomWinstonLogger } from './types';

export class Logger {
  private label: string;

  get logger(): CustomWinstonLogger {
    if (this.childLogger) {
      return this.childLogger;
    } else {
      return this.rootLogger;
    }
  }

  constructor(
    public namespace: string,
    private rootLogger: CustomWinstonLogger,
    private childLogger?: CustomWinstonLogger,
  ) {
    this.label = `[${namespace}]`;
  }

  trace(...msgs: Array<unknown>): void {
    this.rootLogger.trace(this.label, ...msgs);

    if (this.childLogger) {
      this.childLogger.trace(this.label, ...msgs);
    }
  }
  debug(...msgs: Array<unknown>): void {
    this.rootLogger.debug(this.label, ...msgs);

    if (this.childLogger) {
      this.childLogger.debug(this.label, ...msgs);
    }
  }
  info(...msgs: Array<unknown>): void {
    this.rootLogger.info(this.label, ...msgs);

    if (this.childLogger) {
      this.childLogger.info(this.label, ...msgs);
    }
  }
  warn(...msgs: Array<unknown>): void {
    this.rootLogger.warn(this.label, ...msgs);

    if (this.childLogger) {
      this.childLogger.warn(this.label, ...msgs);
    }
  }
  error(...msgs: Array<unknown>): void {
    this.rootLogger.error(this.label, ...msgs);

    if (this.childLogger) {
      this.childLogger.error(this.label, ...msgs);
    }
  }
  fatal(...msgs: Array<unknown>): void {
    this.rootLogger.fatal(this.label, ...msgs);

    if (this.childLogger) {
      this.childLogger.fatal(this.label, ...msgs);
    }
  }

  query(options: winston.QueryOptions, cb: (err: Error, results: unknown) => void): void {
    if (this.childLogger) {
      return this.childLogger.query(options, cb);
    } else {
      return this.rootLogger.query(options, cb);
    }
  }

  stream(options: { [p: string]: unknown }): NodeJS.ReadableStream {
    if (this.childLogger) {
      return this.childLogger.stream(options);
    } else {
      return this.rootLogger.stream(options);
    }
  }
}

export interface RootLogger extends Logger {
  createLogger: CreateChildLoggerFunction;
}
