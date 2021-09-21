# `@elunic/logger`

[![Build Status](https://travis-ci.org/elunic/node-logger.svg?branch=master)](https://travis-ci.org/elunic/node-logger)

Written in TypeScript!

**Important breaking change in v3.0.0**: logger instances are no
longer unique, calling `createLogger()` with the same namespace twice
returns two different instances, and `getLogger()` has been removed
(`MockLogService.getLogger()` is still there).

**Important breaking change in v4.0.0**: The NestJS LoggerModule is not
included by default anymore, mainly to provide a more modular approach
concerning versioning where breaking changes are concerned.

**Important breaking change in v5.0.0**: The CloudWatch integration has been removed; it was causing an unsolvable `npm audit` issue while only being used in a tiny minority of cases. Adding a CloudWatch transporter to Logger instances manually is still possible.

A simple wrapper around `winston` which logs to console as well as multiple files
(with INFO, DEBUG and ERROR levels), with child namespaces (single level).

All loggers are `winston.Logger` instances, meaning you can add custom transports
on top of the default convenience ones.

Provides the `bunyan` error levels:

- `trace`
- `debug`
- `info`
- `warn`
- `error`
- `fatal`

## Table of Contents

- [`@elunic/logger`](#eluniclogger)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Functionality](#functionality)
  - [Usage](#usage)
    - [JSON logging](#json-logging)
    - [Silent mode](#silent-mode)
    - [Important notes on duplicate logger instances](#important-notes-on-duplicate-logger-instances)
    - [Child namespaces](#child-namespaces)
    - [`awilix` service function factory](#awilix-service-function-factory)
    - [`bottlejs` service function factory](#bottlejs-service-function-factory)
    - [`nestjs` integration](#nestjs-integration)
  - [Mock usage](#mock-usage)
    - [`bottlejs`/`awilix` example](#bottlejsawilix-example)
  - [License](#license)

## Installation

```bash
$ npm install @elunic/logger
```

## Functionality

`createLogger()` (root as well as child) returns a `winston` logger with a default `Console` transport attached to it that
logs the colorized log level to the console.

If the root logger is passed the `logPath` option during creation, three files will be created per namespace: one for each of the
INFO, DEBUG and ERROR levels (DEBUG will contain all messages at or above the DEBUG level, and so on).

Subfolders are created for the child loggers' files.

Log messages from the child loggers _also_ get logged through the root logger, which means that the console output _and_ the
root logger's log files contain _all_ messages, but you can drill down to child logs quickly.

## Usage

```javascript
const createLogger = require('@elunic/logger');

const logger = createLogger('app', {
  consoleLevel: process.env.LOG_LEVEL || 'info',
  logPath: process.cwd() + '/logs',
  // Winston logger options
  loggerOptions: {
    silent: false,
  },
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

// Add another Console transport, just for kicks.
logger.add(new winston.transport.Console());
```

### JSON logging

For `NODE_ENV !== 'development'`, the logger will output uncolorized JSON by default.

This behaviour can be overridden by setting the `json` option. The setting for this option will take
precedence over the one determined from the environment.

```javascript
const createLogger = require('@elunic/logger');

const logger = createLogger('app', {
  consoleLevel: process.env.LOG_LEVEL || 'info',
  json: true, // OR: NODE_ENV === 'development' by default
});

logger.warn('something seems funny');
// {"timestamp": "2019-01-31T10:40:31Z", "level": "warn", "namespace": "app", "message": "something seems funny"}
```

### Silent mode

If `consoleLevel` is set to `silent` (`LogLevels.Silent`), nothing will be output
for any level. This can be useful for testing environments, where information
about errors should mostly come from the test cases and expects themselves, and
where you don't want unnecessary output in your console.

This does **not** affect log _files_.

### Important notes on duplicate logger instances

Each call to `createLogger()` creates a **separate logger instance**, even if you call
it twice with the same namespace. Handling of duplicates turned out to
be too prone to errors and edge cases. If you absolutely need singleton
loggers, implement it for your use case.

On the other hand, this means you can pass distinct options on both calls,
if that is a use case (for whatever reason).

### Child namespaces

```javascript
const childLogger = logger.createLogger('foo');
childLogger.info('information about regular operation');
// 2019-01-31T10:40:31Z  INFO [app:foo] information about regular operation

// Will NOT work
const grandChildLogger = childLogger.createLogger('invalid');

// This is also a winston.Logger instance.
logger.add(new winston.transport.Console());
```

### `awilix` service function factory

```javascript
const awilix = require('awilix');
const { createLogger, awilixLogService } = require('@elunic/logger');

const container = awilix.createContainer();
const logger = createLogger('app', {
  consoleLevel: process.env.LOG_LEVEL || 'info',
  logPath: process.cwd() + '/logs',
});

container.register({
  log: awilix.asFunction(awilixLogService(logger)),
});
```

### `bottlejs` service function factory

```javascript
const Bottle = require('bottlejs');
const { createLogger, bottlejsLogService } = require('@elunic/logger');

const bottle = new Bottle();
const logger = createLogger('app', {
  consoleLevel: process.env.LOG_LEVEL || 'info',
  logPath: process.cwd() + '/logs',
});

bottle.factory('log', bottlejsLogService(logger));
```

### `nestjs` integration

Integration for NestJS is provided through the separate module
[@elunic/logger-nestjs](https://www.npmjs.com/package/@elunic/logger-nestjs).

## Mock usage

Mocks for the service are included, both for `awilix`
and `bottlejs` as well as `nestjs` registration. These are to help you when writing
tests so they do not crash. They are silent be default (see below).

Note that the arguments are slightly different than for the
real service. No `logPath` is required, only `namespace` and `debugLevel`.

`debugLevel` is set to silent by default to prevent flooding of your test
output. Setting this to an actual log level is mainly to help with
debugging.

The service can be accessed to retrieve single logger instances and
check whether spies have been called.

### `bottlejs`/`awilix` example

(the example is for `bottlejs`, but works in an analogeous way for `awilix`)

```typescript
import * as Bottle from 'bottlejs';
import { mockBottlejsLogService, MockLogService } from '@elunic/logger/mocks';

describe('my application test', () => {
  let testBottle: Bottle;
  let logService: MockLogService;

  beforeEach(async () => {
    testBottle = new Bottle();

    // Mock log service
    testBottle.factory('log', mockBottlejsLogService('apptest', 'silent'));

    logService = testBottle.container.log;
  });

  it('should call logs', async () => {
    // ... do some actual testing here

    // logService.error is a sinon spy
    expect(logService.error.callCount).toEqual(1);

    // We can to know about some child logger
    const childLoggerSpy = logService.getLogger('apptest:component');
    expect(childLoggerSpy.error.callCount).toEqual(1);
  });
});
```

## License

MIT License

Copyright (c) 2019-2020 elunic AG/William Hefter <wh@elunic.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
