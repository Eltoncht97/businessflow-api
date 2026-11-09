import { validateEnvironment } from './environment.js';

describe('validateEnvironment', () => {
  const validEnvironment = {
    NODE_ENV: 'test',
    PORT: '3000',
    DATABASE_URL: 'postgresql://user:secret@localhost:5432/businessflow',
  };

  it.each([
    'postgresql://user:secret@localhost:5432/businessflow',
    'postgres://localhost/businessflow',
    'postgresql://user:p%40ss@[::1]:5432/businessflow?sslmode=require',
  ])('accepts valid database URL %s', (DATABASE_URL) => {
    expect(
      validateEnvironment({ ...validEnvironment, DATABASE_URL }).DATABASE_URL,
    ).toBe(DATABASE_URL);
  });

  it.each([
    'postgresql://foo',
    'postgresql:///businessflow',
    'postgresql://localhost/',
    'postgresql://localhost:notaport/businessflow',
    'postgresql://localhost:65536/businessflow',
    'postgresql://localhost:0/businessflow',
    'postgresql://localhost/businessflow#fragment',
    'postgresql://localhost/invalid%20name',
    'postgresql://localhost/db/other',
    'https://localhost/businessflow',
  ])('rejects invalid database URL %s', (DATABASE_URL) => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, DATABASE_URL }),
    ).toThrow('Invalid environment variables: DATABASE_URL');
  });

  it('provides pool defaults', () => {
    expect(validateEnvironment(validEnvironment)).toMatchObject({
      DATABASE_POOL_MAX: 10,
      DATABASE_CONNECTION_TIMEOUT_MS: 5000,
      DATABASE_IDLE_TIMEOUT_MS: 30000,
    });
  });

  it('converts configured pool settings to numbers', () => {
    expect(
      validateEnvironment({
        ...validEnvironment,
        DATABASE_POOL_MAX: '4',
        DATABASE_CONNECTION_TIMEOUT_MS: '1000',
        DATABASE_IDLE_TIMEOUT_MS: '2000',
      }),
    ).toMatchObject({
      DATABASE_POOL_MAX: 4,
      DATABASE_CONNECTION_TIMEOUT_MS: 1000,
      DATABASE_IDLE_TIMEOUT_MS: 2000,
    });
  });

  it.each([
    'DATABASE_POOL_MAX',
    'DATABASE_CONNECTION_TIMEOUT_MS',
    'DATABASE_IDLE_TIMEOUT_MS',
  ])('rejects invalid %s settings', (key) => {
    for (const value of ['0', '-1', '1.5', 'invalid']) {
      expect(() =>
        validateEnvironment({ ...validEnvironment, [key]: value }),
      ).toThrow(`Invalid environment variables: ${key}`);
    }
  });

  it('converts the port to a number', () => {
    expect(
      validateEnvironment({
        NODE_ENV: 'test',
        PORT: '3000',
        DATABASE_URL: 'postgresql://user:secret@localhost:5432/businessflow',
      }).PORT,
    ).toBe(3000);
  });

  it('never includes a database URL in validation errors', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'test',
        PORT: '3000',
        DATABASE_URL: 'postgresql://user:secret@localhost:5432/invalid name',
      }),
    ).toThrow('Invalid environment variables: DATABASE_URL');
  });
});
