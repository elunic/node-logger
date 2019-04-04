import * as path from 'path';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

import { levels } from './levels';
import { printf } from './printf';
import {
  CreateChildLoggerOptions,
  CreateLoggerOptions,
  CustomRootWinstonLogger,
  CustomWinstonLogger,
  LogLevels,
} from './types';
import { validateNamespace } from './validateNamespace';

export { CreateLoggerOptions, LogLevels };
export { LogService } from './service';
export { awilixLogService } from './awilix';
export { bottlejsLogService } from './bottlejs';
export { CustomRootWinstonLogger as RootLogger, CustomWinstonLogger as Logger };

const loggerCache: {
  [key: string]: CustomRootWinstonLogger;
} = {};
const childLoggerCache: {
  [key: string]: CustomWinstonLogger;
} = {};

function createLogger(
  rootNamespace: string,
  rawOptions?: CreateLoggerOptions,
): CustomRootWinstonLogger {
  validateNamespace(rootNamespace);

  if (loggerCache.hasOwnProperty(rootNamespace)) {
    throw new Error(`A logger for the namespace '${rootNamespace}' already exists.`);
  }

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
  ) as CustomRootWinstonLogger;
  rootLogger.add(
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

  function _createWinstonLogger(
    namespace: string,
    logPath?: string,
    loggerOptions?: winston.LoggerOptions,
  ): CustomWinstonLogger {
    const winstonLogger = winston.createLogger({
      levels: levels.levels,
      ...(loggerOptions || {}),
    }) as CustomWinstonLogger;

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

  function createChildLogger(
    childNamespace: string,
    rawChildOptions?: CreateChildLoggerOptions,
  ): CustomWinstonLogger {
    const childOptions = Object.assign(
      {},
      {
        loggerOptions: undefined,
      },
      rawChildOptions || {},
    );

    validateNamespace(childNamespace);

    const namespace = `${rootNamespace}:${childNamespace}`;

    if (childLoggerCache.hasOwnProperty(namespace)) {
      throw new Error(`A logger for the namespace '${namespace}' already exists.`);
    }

    const childLogger = _createWinstonLogger(namespace, undefined, childOptions.loggerOptions);
    childLogger.pipe(rootLogger);

    childLoggerCache[namespace] = childLogger;
    return childLogger;
  }

  rootLogger.createLogger = createChildLogger.bind(rootLogger);
  loggerCache[rootNamespace] = rootLogger;
  return rootLogger;
}

export default createLogger;
export { createLogger };

export function getLogger(namespace: string): CustomWinstonLogger | undefined {
  if (loggerCache.hasOwnProperty(namespace)) {
    return loggerCache[namespace] || undefined;
  }
  if (childLoggerCache.hasOwnProperty(namespace)) {
    return childLoggerCache[namespace] || undefined;
  }

  return undefined;
}
