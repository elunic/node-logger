import 'jasmine-expect';
import * as stdMocks from 'std-mocks';

import { createLogger } from '../../src/';

describe('logger', () => {
  let previousNodeEnv: string | undefined;

  function useStdMock() {
    stdMocks.use();
  }
  function stopStdMock() {
    stdMocks.restore();
    return stdMocks.flush();
  }

  beforeEach(async () => {
    previousNodeEnv = process.env.NODE_ENV;
  });

  afterEach(async () => {
    process.env.NODE_ENV = previousNodeEnv;
  });

  describe('for NODE_ENV=development', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
    });

    it('should output an non-JSON INFO string', async () => {
      const logger = createLogger('test');

      useStdMock();
      logger.info('test');
      const actual = stopStdMock();

      expect(actual.stdout[0]).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z.*?\bINFO\b.*?\[test\] test\s*$/,
      );
    });

    it('should output a stringified JSON INFO object when json: true', async () => {
      const logger = createLogger('test', { json: true });

      useStdMock();
      logger.info('test');
      const actual = stopStdMock();

      try {
        const parsed = JSON.parse(actual.stdout[0]);
        expect(parsed).toEqual(
          jasmine.objectContaining({
            message: 'test',
            level: 'info',
            namespace: 'test',
          }),
        );
        expect(parsed.timestamp).toBeIso8601();
      } catch (err) {
        err.message = `Error parsing output JSON: ${err.message}`;
        throw err;
      }
    });
  });

  describe('for NODE_ENV != development', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
    });

    it('should output a stringified JSON string', async () => {
      const logger = createLogger('test').createLogger('child');

      useStdMock();
      logger.info('test');
      const actual = stopStdMock();

      try {
        const parsed = JSON.parse(actual.stdout[0]);
        expect(parsed).toEqual(
          jasmine.objectContaining({
            message: 'test',
            level: 'info',
            namespace: 'test:child',
          }),
        );
        expect(parsed.timestamp).toBeIso8601();
      } catch (err) {
        err.message = `Error parsing output JSON: ${err.message}`;
        throw err;
      }
    });

    it('should output an non-JSON INFO string when json: false', async () => {
      const logger = createLogger('test', { json: false });

      useStdMock();
      logger.info('test');
      const actual = stopStdMock();

      expect(actual.stdout[0]).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z.*?\bINFO\b.*?\[test\] test\s*$/,
      );
    });
  });
});
