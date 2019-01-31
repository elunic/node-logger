import { LogLevels } from '../types';

import { MockLogger, MockRootLogger } from './logger';

export class MockLogService {
  private logger: MockRootLogger;
  private loggers: {
    [key: string]: MockLogger;
  };

  constructor(public namespace: string, private debugLevel: LogLevels | 'silent' = 'silent') {
    this.logger = new MockRootLogger(namespace, debugLevel);

    this.loggers = {
      [namespace]: this.logger,
    };
  }

  createLogger(childNamespace: string): MockLogger {
    const childLogger = new MockLogger(`${this.namespace}:${childNamespace}`, this.debugLevel);

    this.loggers[childNamespace] = childLogger;

    return childLogger;
  }

  get trace() {
    return this.logger.trace;
  }
  get debug() {
    return this.logger.debug;
  }
  get info() {
    return this.logger.info;
  }
  get warn() {
    return this.logger.warn;
  }
  get error() {
    return this.logger.error;
  }
  get fatal() {
    return this.logger.fatal;
  }

  getLogger(fullNamespace: string): MockLogger | MockRootLogger | undefined {
    if (this.loggers.hasOwnProperty(fullNamespace)) {
      return this.loggers[fullNamespace];
    }

    return;
  }
}