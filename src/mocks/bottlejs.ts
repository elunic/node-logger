import { LogLevels } from '../types';
import { MockLogService } from './service';

export function mockBottlejsLogService(
  rootNamespace: string,
  debugLevel: LogLevels | 'silent' = 'silent',
) {
  return function mockBottlejsServiceFactory() {
    return new MockLogService(rootNamespace, debugLevel);
  };
}
