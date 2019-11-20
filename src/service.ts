import * as winston from 'winston';

import { CustomRootWinstonLogger, CustomWinstonLogger } from './types';

export class LogService {
  get namespace() {
    return this.logger.namespace;
  }

  constructor(private logger: CustomRootWinstonLogger | CustomWinstonLogger) {}

  createLogger(childNamespace: string): CustomWinstonLogger {
    if (this.logger.namespace.includes(':')) {
      throw new Error(`Cannot create child logger on non-root logger.`);
    }

    return (this.logger as CustomRootWinstonLogger).createLogger(childNamespace);
  }

  trace(...msgs: unknown[]): void {
    this.logger.trace(...msgs);
  }
  debug(...msgs: unknown[]): void {
    this.logger.debug(...msgs);
  }
  info(...msgs: unknown[]): void {
    this.logger.info(...msgs);
  }
  warn(...msgs: unknown[]): void {
    this.logger.warn(...msgs);
  }
  error(...msgs: unknown[]): void {
    this.logger.error(...msgs);
  }
  fatal(...msgs: unknown[]): void {
    this.logger.fatal(...msgs);
  }

  query(options: winston.QueryOptions, cb: (err: Error, results: unknown) => void): void {
    return this.logger.query(options, cb);
  }
  stream(options: { [p: string]: unknown }): NodeJS.ReadableStream {
    return this.logger.stream(options);
  }
}
