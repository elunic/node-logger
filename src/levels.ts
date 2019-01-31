import * as winston from 'winston';

export const levels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  colors: {
    fatal: 'bold red',
    error: 'bold orange',
    warn: 'yellow',
    info: 'green',
    debug: 'gray',
    trace: 'white',
  },
};

export const levelLabels: { [key: string]: string } = {
  fatal: 'FATAL',
  error: 'ERROR',
  warn: ' WARN',
  info: ' INFO',
  debug: 'DEBUG',
  trace: 'TRACE',
};
