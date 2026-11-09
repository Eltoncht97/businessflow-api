import { jest } from '@jest/globals';
import { ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReadinessService } from './readiness.service.js';

describe('ReadinessService', () => {
  const query = jest.fn<(strings: TemplateStringsArray) => Promise<unknown>>();
  const service = new ReadinessService({
    $queryRaw: query,
  } as unknown as PrismaService);

  afterEach(() => {
    jest.useRealTimers();
    query.mockReset();
  });

  it('checks PostgreSQL with SELECT 1', async () => {
    query.mockResolvedValue([{ '?column?': 1 }]);
    await expect(service.check()).resolves.toEqual({ status: 'ok' });
    expect(query.mock.calls[0]?.[0]).toEqual(['SELECT 1']);
  });

  it('hides database failure details', async () => {
    query.mockRejectedValue(new Error('sensitive connection details'));
    await expect(service.check()).rejects.toThrow(
      new ServiceUnavailableException('Database unavailable'),
    );
  });

  it('fails after three seconds if the query does not finish', async () => {
    jest.useFakeTimers();
    query.mockImplementation(() => new Promise(() => {}));
    const result = expect(service.check()).rejects.toThrow(
      new ServiceUnavailableException('Database unavailable'),
    );
    await jest.advanceTimersByTimeAsync(3000);
    await result;
    expect(jest.getTimerCount()).toBe(0);
  });
});
