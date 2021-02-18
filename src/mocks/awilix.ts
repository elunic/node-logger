import { LogLevels } from '../types';
import { MockLogService } from './service';

export function mockAwilixLogService(
  rootNamespace: string,
  debugLevel: LogLevels | 'silent' = 'silent',
) {
  return function mockAwilixServiceFactory() {
    return new MockLogService(rootNamespace, debugLevel);
  };
}
