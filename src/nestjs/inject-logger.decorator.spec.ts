import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { LogService, RootLogger } from '../index';
import { MockRootLogger } from '../mocks';

import { InjectLogger } from './inject-logger.decorator';
import { LoggerModule } from './logger.module';

describe('NestJS decorator', () => {
  it('works without a namespace and returns the root logger', async () => {
    let injectedService: LogService | undefined;

    @Injectable()
    class FooService {
      constructor(@InjectLogger() private log: LogService) {
        injectedService = this.log;
      }

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

    expect(injectedService).toBeDefined();
    expect((injectedService as LogService).namespace).toBe('test');
  });

  it('works with a namespace and returns a child LogService', async () => {
    let injectedService: LogService | undefined;

    @Injectable()
    class FooService {
      constructor(@InjectLogger('child') private log: LogService) {
        injectedService = this.log;
      }

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

    expect(logger.info.callCount).toEqual(0);

    expect(injectedService).toBeDefined();
    expect(injectedService instanceof LogService).toBe(true);
    expect((injectedService as LogService).namespace).toEqual('test:child');
    // @ts-ignore: access private variable logger
    expect(injectedService.logger.info.callCount).toEqual(1);
    // @ts-ignore: access private variable logger
    expect(injectedService.logger.info.lastCall.lastArg).toEqual('foo');
  });
});
