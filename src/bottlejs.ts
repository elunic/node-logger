import { LogService } from './index';
import { CustomRootWinstonLogger } from './types';

export function bottlejsLogService(logger: CustomRootWinstonLogger) {
  return function bottlejsServiceFactory() {
    return new LogService(logger);
  };
}
