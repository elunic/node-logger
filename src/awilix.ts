import { createLogger, CreateLoggerOptions, LogService } from './index';

export function awilixService(rootNamespace: string, options?: CreateLoggerOptions) {
  return function awilixServiceFactory() {
    return new LogService(rootNamespace, options);
  };
}
