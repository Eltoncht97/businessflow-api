import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  const login = vi.fn<AuthService['login']>();
  const dto = { email: 'user@example.com', password: 'test-password' };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: { login } }],
    }).compile();
    controller = module.get(AuthController);
  });

  it('delegates credentials and returns the service response', async () => {
    const response = { accessToken: 'test-access-token' };
    login.mockResolvedValue(response);
    await expect(controller.login(dto)).resolves.toBe(response);
    expect(login).toHaveBeenCalledExactlyOnceWith(dto.email, dto.password);
  });

  it.each([new UnauthorizedException(), new Error('Authentication failed')])(
    'propagates service errors (%s)',
    async (error) => {
      login.mockRejectedValue(error);
      await expect(controller.login(dto)).rejects.toBe(error);
    },
  );
});
