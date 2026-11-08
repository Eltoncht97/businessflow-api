import { validateEnvironment } from './environment.js';

describe('validateEnvironment', () => {
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
