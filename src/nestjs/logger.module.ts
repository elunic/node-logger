import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import { LogService } from '../service';
import { CustomRootWinstonLogger, CustomWinstonLogger } from '../types';

import { loggerNamespaces } from './inject-logger.decorator';

export const LOGGER = Symbol('LOGGER');

@Global()
@Module({})
export class LoggerModule {
  static forRoot(logger: CustomRootWinstonLogger): DynamicModule {
    const services: Map<string, LogService> = new Map();
    function createLogService(fromLogger: CustomWinstonLogger) {
      if (!services.has(fromLogger.namespace)) {
        services.set(fromLogger.namespace, new LogService(fromLogger));
      }
      return services.get(fromLogger.namespace);
    }

    const providers: Provider[] = [
      {
        provide: LOGGER,
        useFactory: () => createLogService(logger),
      },
    ];

    for (const [logNamespace, injectionToken] of Array.from(loggerNamespaces)) {
      providers.push({
        provide: injectionToken,
        useFactory: () => {
          if (typeof logNamespace === 'string') {
            return createLogService(logger.createLogger(logNamespace));
          } else {
            // Currently, the only symbol identifies the root logger. [wh]
            return createLogService(logger);
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
