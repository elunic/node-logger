# `@elunic/logger`

[![Build Status](https://travis-ci.org/elunic/node-logger.svg?branch=master)](https://travis-ci.org/elunic/node-logger)

A simple wrapper around `winston` which logs to console as well as multiple files (with INFO, DEBUG and ERROR levels), with child namespaces (single level).

All loggers are `winston.Logger` instances, meaning you can add custom transports on top of the default convenience ones.

Provides the `bunyan` error levels.

Written in TypeScript.


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  * [Child namespaces](#child-namespaces)
  * [Important notes](#important-notes)
  * [`awilix` service function factory](#awilix-service-function-factory)
  * [`bottlejs` service function factory](#bottlejs-service-function-factory)
  * [`nestjs` service function factory](#nestjs-service-function-factory)
- [Mock usage](#mock-usage)
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

Log messages from the child loggers *also* get logged through the root logger, which means that the console output *and* the
root logger's log files contain *all* messages, but you can drill down to child logs quickly.


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


### Important notes

The **first** call to `createLogger()` will determine the options
used for that namespace. Loggers are cached, mainly for performance 
reasons as well as to prevent concurrency issues when writing to
the log files.

If your first call to `createLogger()` sets a `consoleLevel` or `logPath`
option, those options will subsequently be re-used, even if you
pass different options.

If you need to re-use a logger for a namespace, use `getLogger('namespace')`
to retrieve a previously created logger instance.


### Retrieve existing loggers

```javascript
const {getLogger} = require('@elunic/logger');

const rootLogger = getLogger('app');

rootLogger.info('info');
```


### `awilix` service function factory

```javascript
const awilix = require('awilix');
const {createLogger, awilixLogService} = require('@elunic/logger');

const container = awilix.createContainer();
const logger = createLogger('app', {
  consoleLevel: process.env.LOG_LEVEL || 'info',
  logPath: process.cwd() + '/logs',
});

container.register({
  log: awilix.asFunction(awilixLogService(logger)),
})
```


### `bottlejs` service function factory

```javascript
const Bottle = require('bottlejs');
const {createLogger, bottlejsLogService} = require('@elunic/logger');

const bottle = new Bottle();
const logger = createLogger('app', {
  consoleLevel: process.env.LOG_LEVEL || 'info',
  logPath: process.cwd() + '/logs',
});

bottle.factory('log', bottlejsLogService(logger));
```


### `nestjs` service function factory

```typescript
import { Module, Injectable, Inject } from '@nestjs/common';
import { createLogger, LogService } from '@elunic/logger';
import { LoggerModule, LOGGER } from '@elunic/logger/nestjs';

const logger = createLogger('app');

@Module({
  imports: [
    LoggerModule.forRoot(logger),
  ],
  providers: [HelperService],
})
export class AppModule {}

@Injectable()
class HelperService {
  constructor(@Inject(LOGGER) private log: LogService) {
  }

  logFoo() {
    this.log.info('foo');
  }
  
  logChild() {
    this.log.createLogger('childLogger').info('child foo');
  }
}
```



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

### `nestjs` example

Image that `CatsService` depends on our `LogService`:

```typescript
import { MockNestjsLoggerModule, MockLogService } from '@elunic/logger/mocks';
import { CatsService } from './cats.service';

describe('NestJS module', () => {
  let catsService: CatsService;
  let logService: MockLogService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
        imports: [MockNestjsLoggerModule],
        providers: [CatsService],
      }).compile();

    catsService = module.get<CatsService>(CatsService);
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

Copyright (c) 2019 elunic AG/William Hefter <wh@elunic.com>

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
