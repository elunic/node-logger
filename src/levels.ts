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
    error: 'red',
    warn: 'yellow',
    info: 'blue',
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
