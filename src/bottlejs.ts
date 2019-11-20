import { LogService } from './index';
import { RootLogger } from './types';

export function bottlejsLogService(logger: RootLogger) {
  return function bottlejsServiceFactory() {
    return new LogService(logger);
  };
}
