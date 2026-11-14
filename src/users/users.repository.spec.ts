import { Test } from '@nestjs/testing';
import type { User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersRepository } from './users.repository.js';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  const findUnique =
    vi.fn<(args: { where: { email: string } }) => Promise<User | null>>();
  const user: User = {
    id: '7a6baf3d-eaaf-41c1-a98c-a063d820a420',
    firstName: 'Test',
    lastName: 'User',
    email: 'user@example.com',
    passwordHash: 'test-password-hash',
    isActive: true,
    tokenVersion: 1,
    departmentId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: { user: { findUnique } } },
      ],
    }).compile();
    repository = module.get(UsersRepository);
  });

  it.each([user, null])(
    'returns the Prisma lookup result (%s)',
    async (result) => {
      findUnique.mockResolvedValue(result);
      await expect(repository.findByEmail(user.email)).resolves.toBe(result);
      expect(findUnique).toHaveBeenCalledExactlyOnceWith({
        where: { email: user.email },
      });
    },
  );

  it('propagates Prisma errors', async () => {
    const error = new Error('Database lookup failed');
    findUnique.mockRejectedValue(error);
    await expect(repository.findByEmail(user.email)).rejects.toBe(error);
  });
});
