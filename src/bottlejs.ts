import { CreateLoggerOptions, LogService } from './index';

export function bottlejsService(rootNamespace: string, options?: CreateLoggerOptions) {
  return function bottlejsServiceFactory() {
    return new LogService(rootNamespace, options);
  };
}
