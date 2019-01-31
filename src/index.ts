import * as path from 'path';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

import { levels } from './levels';
import { Logger, RootLogger } from './logger';
import { printf } from './printf';
import { CreateLoggerOptions, CustomWinstonLogger, LogLevels } from './types';

export { CreateLoggerOptions, Logger, RootLogger, LogLevels };
export { LogService } from './service';
export { awilixService } from './awilix';
export { bottlejsService } from './bottlejs';

export * from './mocks';

function validateNamespace(namespace: string) {
  if (!namespace) {
    throw new Error(`'namespace' must not be empty`);
  }

  if (!namespace.match(/^[\w-]+$/)) {
    throw new Error(`Invalid characters in namespace: ${namespace.replace(/[\w-]/, '')}`);
  }
}

const loggerCache: {
  [key: string]: RootLogger;
} = {};
const childLoggerCache: {
  [key: string]: Logger;
} = {};

function createLogger(rootNamespace: string, rawOptions?: CreateLoggerOptions): RootLogger {
  validateNamespace(rootNamespace);

  if (loggerCache.hasOwnProperty(rootNamespace)) {
    return loggerCache[rootNamespace];
  }

  const options = Object.assign(
    {},
    {
      consoleLevel: LogLevels.Info,
      logPath: undefined,
    },
    rawOptions || {},
  );

  const rootWinstonLogger = _createWinstonLogger(rootNamespace, options);
  rootWinstonLogger.add(
    new winston.transports.Console({
      level: options.consoleLevel || 'info',
      format: winston.format.combine(
        winston.format.colorize({
          colors: levels.colors,
        }),
        winston.format.timestamp(),
        winston.format.printf(printf),
      ),
    }),
  );

  const rootLogger = new Logger(rootNamespace, rootWinstonLogger);

  function _createWinstonLogger(
    namespace: string,
    options: CreateLoggerOptions,
  ): CustomWinstonLogger {
    const winstonLogger = winston.createLogger({
      levels: levels.levels,
    }) as CustomWinstonLogger;

    if (options.logPath) {
      let relativeLogPath: string;
      if (namespace === rootNamespace) {
        relativeLogPath = '';
      } else {
        relativeLogPath = namespace
          .replace(new RegExp(`^${rootNamespace}:`), '')
          .replace(':', path.sep);
      }

      const dirname = path.join(options.logPath, relativeLogPath);

      const fileFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(printf),
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

  function createLogger(childNamespace: string): Logger {
    validateNamespace(childNamespace);

    const namespace = `${rootNamespace}:${childNamespace}`;

    if (childLoggerCache.hasOwnProperty(namespace)) {
      return childLoggerCache[namespace];
    }

    const childLogger = new Logger(
      namespace,
      rootWinstonLogger,
      _createWinstonLogger(namespace, options),
    );

    childLoggerCache[namespace] = childLogger;
    return childLogger;
  }

  (rootLogger as RootLogger).createLogger = createLogger.bind(rootLogger);
  loggerCache[rootNamespace] = rootLogger as RootLogger;
  return rootLogger as RootLogger;
}

export default createLogger;
export { createLogger };
