import { Test } from '@nestjs/testing';
import type { User } from '../generated/prisma/client.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  const findByEmail = vi.fn<UsersRepository['findByEmail']>();
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
        UsersService,
        { provide: UsersRepository, useValue: { findByEmail } },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('normalizes the email and returns the repository user', async () => {
    findByEmail.mockResolvedValue(user);
    await expect(service.findByEmail('USER@Example.COM')).resolves.toBe(user);
    expect(findByEmail).toHaveBeenCalledExactlyOnceWith('user@example.com');
  });

  it('returns null when the user does not exist', async () => {
    findByEmail.mockResolvedValue(null);
    await expect(service.findByEmail(user.email)).resolves.toBeNull();
  });

  it('propagates repository errors', async () => {
    const error = new Error('User lookup failed');
    findByEmail.mockRejectedValue(error);
    await expect(service.findByEmail(user.email)).rejects.toBe(error);
  });
});
