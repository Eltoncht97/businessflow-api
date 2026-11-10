import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

describe('PostgreSQL integration', () => {
  const connectionString = process.env.TEST_DATABASE_URL;

  beforeAll(() => {
    if (!connectionString) {
      throw new Error('TEST_DATABASE_URL is required for integration tests');
    }
    const database = new URL(connectionString).pathname.slice(1);
    if (database !== 'businessflow_test') {
      throw new Error(
        'Integration tests require the businessflow_test database',
      );
    }
  });

  it('connects to the isolated test database', async () => {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: connectionString! }),
    });
    try {
      const rows = await prisma.$queryRaw<
        Array<{ database: string; one: number }>
      >`
        SELECT current_database() AS database, 1 AS one
      `;
      expect(rows).toEqual([{ database: 'businessflow_test', one: 1 }]);
    } finally {
      await prisma.$disconnect();
    }
  });
});
