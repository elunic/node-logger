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
- [Mock usage](#mock-usage)
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


## Mock usage

Mocks for the service are included, both for `awilix` 
and `bottlejs` registration. These are to help you when writing
tests so they do not crash. They are silent be default (see below).

Note that the arguments are slightly different than for the 
real service. No `logPath` is required, only `namespace` and `debugLevel`.

`debugLevel` is set to silent by default to prevent flooding of your test
output. Setting this to an actual log level is mainly to help with
debugging.

The service can be accessed to retrieve single logger instances and
check whether spies have been called.

(the example is for `bottlejs`, but works in an analogeous way for `awilix`)

```typescript
import * as Bottle from 'bottlejs';
import { mockBottlejsService, MockLogService } from '@elunic/logger';

describe('my application test', () => {
  let testBottle: Bottle;
  let logService: MockLogService;
  
  beforeEach(async () => {
    testBottle = new Bottle();
    
    // Mock log service
    testBottle.factory('log', mockBottlejsService('apptest', 'silent'));
    
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
