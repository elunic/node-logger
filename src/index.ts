import * as Joi from '@hapi/joi';
import * as path from 'path';
import * as winston from 'winston';
import * as WinstonCloudwatch from 'winston-cloudwatch';
import * as DailyRotateFile from 'winston-daily-rotate-file';

import { levels } from './levels';
import {
  CreateChildLoggerOptions,
  CreateRootLoggerOptions,
  Logger,
  LogLevels,
  RootLogger,
  ROOT_LOGGER_OPTIONS_SCHEMA,
} from './types';
import { cloudwatchMessageFormatterFactory } from './utils/cloudwatch-message-formatter';
import { defaultFormat } from './utils/defaultFormat';
import { printf } from './utils/printf';
import { validateNamespace } from './validateNamespace';

export { CreateRootLoggerOptions, LogLevels };
export { defaultFormat };
export { printf };
export { LogService } from './service';
export { awilixLogService } from './awilix';
export { bottlejsLogService } from './bottlejs';

export { RootLogger, Logger };
export { CreateChildLoggerOptions } from './types';

type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

function createLogger(
  rootNamespace: string,
  rawOptions?: DeepPartial<CreateRootLoggerOptions>,
): RootLogger {
  validateNamespace(rootNamespace);

  const options: CreateRootLoggerOptions = Joi.attempt(
    rawOptions || {},
    ROOT_LOGGER_OPTIONS_SCHEMA,
  );

  const rootLogger = _createWinstonLogger(
    rootNamespace,
    options.logPath,
    options.loggerOptions,
  ) as RootLogger;

  rootLogger.add(
    new winston.transports.Console({
      level: options.consoleLevel || 'info',
      format: options.json
        ? winston.format.combine(winston.format.timestamp(), winston.format.json())
        : winston.format.combine(
            winston.format.colorize({
              colors: levels.colors,
            }),
            winston.format.timestamp(),
            winston.format.printf(printf),
          ),
    }),
  );

  if (options.cloudWatch.enabled) {
    rootLogger.add(
      // @ts-ignore: winston-cloudwatch's type definition is incorrect (should be TransformableInfo)
      new WinstonCloudwatch({
        jsonMessage: options.json,
        messageFormatter: options.json
          ? undefined
          : cloudwatchMessageFormatterFactory(
              winston.format.combine(winston.format.timestamp(), winston.format.printf(printf)),
            ),
        awsSecretKey: options.cloudWatch.awsSecretKey,
        awsAccessKeyId: options.cloudWatch.awsAccessKeyId,
        awsRegion: options.cloudWatch.awsRegion,
        level: options.cloudWatch.level,
        logGroupName: options.cloudWatch.logGroupName,
        logStreamName: options.cloudWatch.logStreamName,
      }),
    );
  }

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
