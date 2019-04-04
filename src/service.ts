import * as winston from 'winston';

import { CustomRootWinstonLogger, CustomWinstonLogger } from './types';

export class LogService {
  get namespace() {
    return this.logger.namespace;
  }

  constructor(private logger: CustomRootWinstonLogger) {}

  createLogger(childNamespace: string): CustomWinstonLogger {
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
