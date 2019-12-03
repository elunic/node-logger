import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { LogService } from '../service';
import { RootLogger } from '../types';

import { loggerNamespaces } from './inject-logger.decorator';

export const LOGGER = Symbol('LOGGER');

@Global()
@Module({})
export class LoggerModule {
  static forRoot(logger: RootLogger): DynamicModule {
    const providers: Provider[] = [
      {
        provide: LOGGER,
        useFactory: () => new LogService(logger),
      },
    ];

    for (const [logNamespace, [injectionToken, rawChildOptions]] of Array.from(loggerNamespaces)) {
      providers.push({
        provide: injectionToken,
        useFactory: () => {
          if (typeof logNamespace === 'string') {
            return new LogService(logger.createLogger(logNamespace, rawChildOptions));
          } else {
            // Currently, the only symbol identifies the root logger. [wh]
            return new LogService(logger);
          }
        },
      });
    }

    return {
      module: LoggerModule,
      providers,
      exports: providers,
    };
  }
}
