import { LogService } from './index';
import { RootLogger } from './types';

export function awilixLogService(logger: RootLogger) {
  return function awilixServiceFactory() {
    return new LogService(logger);
  };
}
