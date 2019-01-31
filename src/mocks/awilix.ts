import { LogLevels } from '../types';

import { MockLogService } from './service';

export function mockAwilixService(
  rootNamespace: string,
  debugLevel: LogLevels | 'silent' = 'silent',
) {
  return function mockAwilixServiceFactory() {
    return new MockLogService(rootNamespace, debugLevel);
  };
}
