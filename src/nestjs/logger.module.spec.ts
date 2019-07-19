import { Inject, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import createLogger, { LogService, RootLogger } from '../index';
import { MockRootLogger } from '../mocks';

import { LOGGER, LoggerModule } from './logger.module';

describe('NestJS module', () => {
  it('boots successfully', async () => {
    const logger = createLogger('test');

    const rootModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(logger)],
    }).compile();

    expect(rootModule.get(LOGGER) instanceof LogService).toBeTruthy();
  });

  it('is usable', async () => {
    @Injectable()
    class FooService {
      constructor(@Inject(LOGGER) private log: LogService) {}

      logFoo() {
        this.log.info('foo');
      }
    }

    @Module({
      providers: [FooService],
    })
    class FooModule {}

    const logger = new MockRootLogger('test');
    const rootModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot((logger as unknown) as RootLogger), FooModule],
    }).compile();

    const app = rootModule.createNestApplication();
    await app.init();

    const fooService = rootModule.get<FooService>(FooService);
    fooService.logFoo();

    expect(logger.info.callCount).toEqual(1);
    expect(logger.info.lastCall.lastArg).toEqual('foo');
  });
});
