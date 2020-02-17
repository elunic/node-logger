import { DynamicModule, Module, Provider } from '@nestjs/common';

import { LogService } from '../service';
import { RootLogger } from '../types';

import { loggerNamespaces } from './inject-logger.decorator';

export const LOGGER = Symbol('LOGGER');

export interface LoggerModuleOptions {
  isGlobal: boolean;
}

@Module({})
export class LoggerModule {
  static forRoot(logger: RootLogger, options: Partial<LoggerModuleOptions> = {}): DynamicModule {
    options = Object.assign(
      {
        isGlobal: true,
      },
      options || {},
    );

    const providers: Provider[] = [
      {
        provide: LOGGER,
        useFactory: () => new LogService(logger),
      },
      ...this.createLoggerProviders(logger),
    ];

    return {
      module: LoggerModule,
      global: !!options.isGlobal,
      providers,
      exports: providers,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: LoggerModule,
    };
  }

  private static createLoggerProviders(logger: RootLogger): Provider[] {
    const providers: Provider[] = [];

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

    return providers;
  }
}
