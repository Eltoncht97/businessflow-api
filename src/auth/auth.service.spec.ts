import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import type { User } from '../generated/prisma/client.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

vi.mock('argon2', () => ({ verify: vi.fn() }));

describe('AuthService', () => {
  let service: AuthService;
  const findByEmail = vi.fn<UsersService['findByEmail']>();
  const signAsync = vi.fn<JwtService['signAsync']>();
  const user: User = {
    id: '7a6baf3d-eaaf-41c1-a98c-a063d820a420',
    firstName: 'Test',
    lastName: 'User',
    email: 'user@example.com',
    passwordHash: 'test-password-hash',
    isActive: true,
    tokenVersion: 3,
    departmentId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
  const password = 'test-password';

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: { findByEmail } },
        { provide: JwtService, useValue: { signAsync } },
      ],
    }).compile();
    service = module.get(AuthService);
    findByEmail.mockResolvedValue(user);
    vi.mocked(argon2.verify).mockResolvedValue(true);
    signAsync.mockResolvedValue('test-access-token');
  });

  it('returns an access token for an active user with a valid password', async () => {
    await expect(service.login(user.email, password)).resolves.toEqual({
      accessToken: 'test-access-token',
    });
    expect(findByEmail).toHaveBeenCalledExactlyOnceWith(user.email);
    expect(argon2.verify).toHaveBeenCalledExactlyOnceWith(
      user.passwordHash,
      password,
    );
    expect(signAsync).toHaveBeenCalledExactlyOnceWith({
      sub: user.id,
      tokenVersion: user.tokenVersion,
    });
  });

  it.each([
    ['missing', null],
    ['inactive', { ...user, isActive: false }],
  ])(
    'rejects a %s user without verifying the password or signing a JWT',
    async (_case, result) => {
      findByEmail.mockResolvedValue(result);
      await expect(service.login(user.email, password)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(argon2.verify).not.toHaveBeenCalled();
      expect(signAsync).not.toHaveBeenCalled();
    },
  );

  it('rejects an incorrect password without signing a JWT', async () => {
    vi.mocked(argon2.verify).mockResolvedValue(false);
    await expect(service.login(user.email, password)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(argon2.verify).toHaveBeenCalledExactlyOnceWith(
      user.passwordHash,
      password,
    );
    expect(signAsync).not.toHaveBeenCalled();
  });

  it('propagates an Argon2 error without signing a JWT', async () => {
    const error = new Error('Password verification failed');
    vi.mocked(argon2.verify).mockRejectedValue(error);
    await expect(service.login(user.email, password)).rejects.toBe(error);
    expect(signAsync).not.toHaveBeenCalled();
  });

  it('propagates a JWT signing error', async () => {
    const error = new Error('JWT signing failed');
    signAsync.mockRejectedValue(error);
    await expect(service.login(user.email, password)).rejects.toBe(error);
    expect(signAsync).toHaveBeenCalledExactlyOnceWith({
      sub: user.id,
      tokenVersion: user.tokenVersion,
    });
  });
});
