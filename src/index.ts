import * as path from 'path';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

import { defaultFormat } from './defaultFormat';
import { levels } from './levels';
import {
  CreateChildLoggerOptions,
  CreateRootLoggerOptions,
  Logger,
  LogLevels,
  RootLogger,
} from './types';
import { validateNamespace } from './validateNamespace';

export { CreateRootLoggerOptions, LogLevels };
export { defaultFormat };
export { LogService } from './service';
export { awilixLogService } from './awilix';
export { bottlejsLogService } from './bottlejs';

export { RootLogger, Logger };
export {
  CustomRootWinstonLogger,
  CustomWinstonLogger,
  CreateLoggerOptions,
  CreateChildLoggerOptions,
} from './types';

function createLogger(rootNamespace: string, rawOptions?: CreateRootLoggerOptions): RootLogger {
  validateNamespace(rootNamespace);

  const options = Object.assign(
    {},
    {
      consoleLevel: LogLevels.Info,
      logPath: undefined,
      loggerOptions: undefined,
    },
    rawOptions || {},
  );

  const rootLogger = _createWinstonLogger(
    rootNamespace,
    options.logPath,
    options.loggerOptions,
  ) as RootLogger;
  rootLogger.add(
    new winston.transports.Console({
      level: options.consoleLevel || 'info',
      format: winston.format.combine(
        winston.format.colorize({
          colors: levels.colors,
        }),
        defaultFormat,
        // winston.format.timestamp(),
        // winston.format.printf(printf),
      ),
    }),
  );

  function _createWinstonLogger(
    namespace: string,
    logPath?: string,
    loggerOptions?: winston.LoggerOptions,
  ): Logger {
    const winstonLogger = winston.createLogger({
      levels: levels.levels,
      ...(loggerOptions || {}),
      defaultMeta: {
        ...(loggerOptions && loggerOptions.defaultMeta ? loggerOptions.defaultMeta : {}),
        namespace,
      },
    }) as Logger;

    Object.defineProperty(winstonLogger, 'namespace', {
      configurable: false,
      enumerable: true,
      value: namespace,
      writable: false,
    });

    if (logPath) {
      let relativeLogPath: string;
      if (namespace === rootNamespace) {
        relativeLogPath = '';
      } else {
        relativeLogPath = namespace
          .replace(new RegExp(`^${rootNamespace}:`), '')
          .replace(':', path.sep);
      }

      const dirname = path.join(logPath, relativeLogPath);

      const fileFormat = winston.format.combine(
        defaultFormat,
        // winston.format.timestamp(),
        // winston.format.printf(printf),
      );

      winstonLogger.add(
        new DailyRotateFile({
          level: 'info',
          dirname,
          filename: 'info.%DATE%.log',
          format: fileFormat,
        }),
      );
      winstonLogger.add(
        new DailyRotateFile({
          level: 'error',
          dirname,
          filename: 'error.%DATE%.log',
          format: fileFormat,
        }),
      );
      winstonLogger.add(
        new DailyRotateFile({
          level: 'debug',
          dirname,
          filename: 'debug.%DATE%.log',
          format: fileFormat,
        }),
      );
    }

    return winstonLogger;
  }

  function createChildLogger(
    childNamespace: string,
    rawChildOptions?: CreateChildLoggerOptions,
  ): Logger {
    const childOptions = Object.assign(
      {},
      {
        loggerOptions: undefined,
      },
      rawChildOptions || {},
    );

    validateNamespace(childNamespace);

    const namespace = `${rootNamespace}:${childNamespace}`;

    const childLogger = _createWinstonLogger(namespace, undefined, childOptions.loggerOptions);

    // Workaround for the MaxListenersExceededWarning. Seems the number of listeners is at exactly 10
    // before this call. It seems that increasing by exactly 1 helps (since we're adding one listener..)
    rootLogger.setMaxListeners(rootLogger.getMaxListeners() + 1);

    childLogger.pipe(rootLogger);

    return childLogger;
  }

  rootLogger.createLogger = createChildLogger.bind(rootLogger);
  return rootLogger;
}

export default createLogger;
export { createLogger };
