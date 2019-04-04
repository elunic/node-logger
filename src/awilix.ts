import { LogService } from './index';
import { CustomRootWinstonLogger } from './types';

export function awilixLogService(logger: CustomRootWinstonLogger) {
  return function awilixServiceFactory() {
    return new LogService(logger);
  };
}
