import { CreateLoggerOptions, LogService } from './index';

export function bottlejsLogService(rootNamespace: string, options?: CreateLoggerOptions) {
  return function bottlejsServiceFactory() {
    return new LogService(rootNamespace, options);
  };
}
