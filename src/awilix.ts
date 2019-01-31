import { CreateLoggerOptions, LogService } from './index';

export function awilixLogService(rootNamespace: string, options?: CreateLoggerOptions) {
  return function awilixServiceFactory() {
    return new LogService(rootNamespace, options);
  };
}
