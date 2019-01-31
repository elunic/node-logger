import * as winston from 'winston';

import { createLogger } from './index';
import { Logger, RootLogger } from './logger';
import { CreateChildLoggerFunction, CreateLoggerOptions } from './types';

export class LogService {
  private logger: RootLogger;

  constructor(public namespace: string, options?: CreateLoggerOptions) {
    this.logger = createLogger(namespace, options);
  }

  createLogger(childNamespace: string): Logger {
    return this.logger.createLogger(childNamespace);
  }

  trace(...msgs: Array<unknown>): void {
    this.logger.trace(...msgs);
  }
  debug(...msgs: Array<unknown>): void {
    this.logger.debug(...msgs);
  }
  info(...msgs: Array<unknown>): void {
    this.logger.info(...msgs);
  }
  warn(...msgs: Array<unknown>): void {
    this.logger.warn(...msgs);
  }
  error(...msgs: Array<unknown>): void {
    this.logger.error(...msgs);
  }
  fatal(...msgs: Array<unknown>): void {
    this.logger.fatal(...msgs);
  }

  query(options: winston.QueryOptions, cb: (err: Error, results: unknown) => void): void {
    return this.logger.query(options, cb);
  }
  stream(options: { [p: string]: unknown }): NodeJS.ReadableStream {
    return this.logger.stream(options);
  }
}
