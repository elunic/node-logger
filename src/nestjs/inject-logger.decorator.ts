import { Inject } from '@nestjs/common';

import { CreateChildLoggerOptions } from '../types';

const TOKEN_PREFIX_BASE = 'LOGGER__';
export const TOKEN_PREFIX = TOKEN_PREFIX_BASE + '_';
export const ROOT_LOGGER_TOKEN = Symbol('ROOT_LOGGER');

export const loggerNamespaces: Map<
  string | Symbol,
  [string, CreateChildLoggerOptions | undefined]
> = new Map();

export function InjectLogger(childNamespace?: string, rawChildOptions?: CreateChildLoggerOptions) {
  if (childNamespace) {
    const injectionToken = TOKEN_PREFIX + childNamespace;
    if (!loggerNamespaces.has(childNamespace)) {
      loggerNamespaces.set(childNamespace, [injectionToken, rawChildOptions]);
    }

    // We need the additional '_' to prevent accidental overlap with the root logger. [wh]
    return Inject(injectionToken);
  } else {
    const injectionToken = TOKEN_PREFIX_BASE + 'ROOT';
    loggerNamespaces.set(ROOT_LOGGER_TOKEN, [injectionToken, undefined]);
    return Inject(injectionToken);
  }
}
