import * as sinon from 'sinon';

import { LogLevels } from '../types';

export class MockLogger {
  protected fakes: {
    [key: string]: sinon.SinonSpy;
  };

  constructor(public namespace: string, public debugLevel: LogLevels | 'silent' = 'silent') {
    let numDebugLevel: number;
    switch (debugLevel) {
      case 'trace':
        numDebugLevel = 10;
        break;
      case 'debug':
        numDebugLevel = 20;
        break;
      case 'info':
        numDebugLevel = 30;
        break;
      case 'warn':
        numDebugLevel = 40;
        break;
      case 'error':
        numDebugLevel = 50;
        break;
      case 'fatal':
        numDebugLevel = 60;
        break;
      case 'silent':
        numDebugLevel = 70;
        break;
      default:
        throw new Error(`Invalid debugLevel ${debugLevel}`);
    }

    this.fakes = {
      trace: sinon.fake((...args: unknown[]) =>
        // eslint-disable-next-line no-console
        numDebugLevel <= 10 ? console.debug(`TRACE [${namespace}]`, ...args) : undefined,
      ),
      debug: sinon.fake((...args: unknown[]) =>
        // eslint-disable-next-line no-console
        numDebugLevel <= 20 ? console.debug(`DEBUG [${namespace}]`, ...args) : undefined,
      ),
      info: sinon.fake((...args: unknown[]) =>
        // eslint-disable-next-line no-console
        numDebugLevel <= 30 ? console.log(` INFO [${namespace}]`, ...args) : undefined,
      ),
      warn: sinon.fake((...args: unknown[]) =>
        // eslint-disable-next-line no-console
        numDebugLevel <= 40 ? console.warn(` WARN [${namespace}]`, ...args) : undefined,
      ),
      error: sinon.fake((...args: unknown[]) =>
        // eslint-disable-next-line no-console
        numDebugLevel <= 50 ? console.error(`ERROR [${namespace}]`, ...args) : undefined,
      ),
      fatal: sinon.fake((...args: unknown[]) =>
        // eslint-disable-next-line no-console
        numDebugLevel <= 60 ? console.error(`FATAL [${namespace}]`, ...args) : undefined,
      ),
    };
  }

  get trace() {
    return this.fakes.trace;
  }
  get debug() {
    return this.fakes.debug;
  }
  get info() {
    return this.fakes.info;
  }
  get warn() {
    return this.fakes.warn;
  }
  get error() {
    return this.fakes.error;
  }
  get fatal() {
    return this.fakes.fatal;
  }
}

export class MockRootLogger extends MockLogger {
  constructor(public namespace: string, public debugLevel: LogLevels | 'silent' = 'silent') {
    super(namespace, debugLevel);
  }

  createLogger(childNamespace: string): MockLogger {
    return new MockLogger(`${this.namespace}:${childNamespace}`, this.debugLevel);
  }
}
