import { Inject } from '@nestjs/common';

const TOKEN_PREFIX_BASE = 'LOGGER__';
export const TOKEN_PREFIX = TOKEN_PREFIX_BASE + '_';
export const ROOT_LOGGER_TOKEN = Symbol('ROOT_LOGGER');

export const loggerNamespaces: Map<string | Symbol, string> = new Map();

export function InjectLogger(namespace?: string) {
  if (namespace) {
    const injectionToken = TOKEN_PREFIX + namespace;
    if (!loggerNamespaces.has(namespace)) {
      loggerNamespaces.set(namespace, injectionToken);
    }

    // We need the additional '_' to prevent accidental overlap with the root logger. [wh]
    return Inject(injectionToken);
  } else {
    const injectionToken = TOKEN_PREFIX_BASE + 'ROOT';
    loggerNamespaces.set(ROOT_LOGGER_TOKEN, injectionToken);
    return Inject(injectionToken);
  }
}
