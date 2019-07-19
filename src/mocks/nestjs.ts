import { DynamicModule, Global, Module } from '@nestjs/common';

import { LOGGER } from '../nestjs';
import { LogLevels } from '../types';

import { MockLogService } from './service';

@Global()
@Module({})
export class MockNestjsLoggerModule {
  static forRoot(
    rootNamespace: string,
    debugLevel: LogLevels | 'silent' = 'silent',
  ): DynamicModule {
    const providers = [
      {
        provide: LOGGER,
        useFactory: () => new MockLogService(rootNamespace, debugLevel),
      },
    ];

    return {
      module: MockNestjsLoggerModule,
      providers,
      exports: providers,
    };
  }
}
