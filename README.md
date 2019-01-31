# busboy-express

[![Build Status](https://travis-ci.org/elunic/node-logger.svg?branch=master)](https://travis-ci.org/elunic/node-logger)

A simple wrapper around `winston` which logs to console as well as multiple files (with INFO, DEBUG and ERROR levels), with child namespaces (single level).

Provides the `bunyan` error levels.

Ships with TypeScript bindings.


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  * [Child namespaces](#child-namespaces)
  * [Important notes](#important-notes)
  * [`awilix` service function factory](#awilix-service-function-factory)
  * [`bottlejs` service function factory](#bottlejs-service-function-factory)
- [License](#license)


## Installation

```bash
$ npm install @elunic/logger
```


## Usage

```javascript
const createLogger = require('@elunic/logger');

const logger = createLogger('app', {
  consoleLevel: process.env.LOG_LEVEL || 'info',
  logPath: process.cwd() + '/logs',
});

logger('information about regular operation');
// 2019-01-31T10:40:31Z  INFO [app] information about regular operation

logger.fatal('unrecoverable error, an operator should look at this as soon as possible');
// 2019-01-31T10:40:31Z FATAL [app] unrecoverable error, an operator should look at this as soon as possible

logger.error('recoverable error');
// 2019-01-31T10:40:31Z ERROR [app] recoverable error

logger.warn('warning');
// 2019-01-31T10:40:31Z  WARN [app] warning

logger.info('information about regular operation');
// 2019-01-31T10:40:31Z  INFO [app] information about regular operation

logger.debug('debug information, perhaps useful during development or troubleshooting');
// 2019-01-31T10:40:31Z DEBUG [app] debug information, perhaps useful during development or troubleshooting

logger.trace('highly detailed information');
// 2019-01-31T10:40:31Z TRACE [app] highly detailed information
```


### Child namespaces

```javascript
const childLogger = logger.createLogger('foo');
childLogger.info('information about regular operation');
// 2019-01-31T10:40:31Z  INFO [app:foo] information about regular operation

// Will NOT work
const grandChildLogger = childLogger.createLogger('invalid');
```


### Important notes

The **first** call to `createLogger()` will determine the options
used for that namespace. Loggers are cached, mainly for performance 
reasons as well as to prevent concurrency issues when writing to
the log files.

If your first call to `createLogger()` sets a `consoleLevel` or `logPath`
option, those options will subsequently be re-used, even if you
pass different options while declaring a DI service (see below).


### `awilix` service function factory

```javascript
const awilix = require('awilix');
const {awilixService} = require('@elunic/logger');

const container = awilix.createContainer();

container.register({
  log: awilix.asFunction(awilixService('app', {
    consoleLevel: process.env.LOG_LEVEL || 'info',
    logPath: process.cwd() + '/logs',
  })),
})
```


### `bottlejs` service function factory

```javascript
const Bottle = require('bottlejs');
const {bottlejsService} = require('@elunic/logger');

const bottle = new Bottle();

bottle.factory('log', bottlejsService('app', {
  consoleLevel: process.env.LOG_LEVEL || 'info',
  logPath: process.cwd() + '/logs',
}));
```




