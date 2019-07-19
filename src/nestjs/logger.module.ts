import { DynamicModule, Global, Module } from '@nestjs/common';

import { LogService } from '../service';
import { CustomRootWinstonLogger } from '../types';

export const LOGGER = Symbol('LOGGER');

@Global()
@Module({})
export class LoggerModule {
  static forRoot(logger: CustomRootWinstonLogger): DynamicModule {
    const providers = [
      {
        provide: LOGGER,
        useFactory: () => new LogService(logger),
      },
    ];

    return {
      module: LoggerModule,
      providers,
      exports: providers,
    };
  }
}
