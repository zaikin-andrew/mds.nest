import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { VkService } from '../../services/vk/vk.service';

function makeCtx(headers: Record<string, string>, isPublicResult = false): ExecutionContext {
  const req: Record<string, unknown> = { headers };
  return {
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({
      getRequest: () => req,
    }),
    _req: req,
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let firebaseService: jest.Mocked<FirebaseService>;
  let vkService: jest.Mocked<VkService>;
  let userModel: { findOne: jest.Mock };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as jest.Mocked<Reflector>;
    firebaseService = { verifyToken: jest.fn() } as unknown as jest.Mocked<FirebaseService>;
    vkService = { verifyVkToken: jest.fn() } as unknown as jest.Mocked<VkService>;
    userModel = { findOne: jest.fn() };

    guard = new AuthGuard(reflector, firebaseService, vkService, userModel as any);
  });

  it('returns true for public routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const ctx = makeCtx({});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws UnauthorizedException when no token header', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const ctx = makeCtx({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('resolves Firebase user and sets req.user', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    firebaseService.verifyToken.mockResolvedValue({
      uid: 'firebase-uid-123',
      name: 'John',
      email: 'john@example.com',
      picture: 'https://pic.com/avatar.jpg',
    } as any);

    const ctx = makeCtx({ authorization: 'Bearer firebase-token' });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(firebaseService.verifyToken).toHaveBeenCalledWith('Bearer firebase-token');
    const req = (ctx as any)._req;
    expect(req.user).toEqual({
      id: 'firebase-uid-123',
      name: 'John',
      email: 'john@example.com',
      picture: 'https://pic.com/avatar.jpg',
    });
  });

  it('throws UnauthorizedException when Firebase token is invalid', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    firebaseService.verifyToken.mockRejectedValue(new Error('invalid token'));

    const ctx = makeCtx({ authorization: 'invalid-token' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('resolves VK user and sets req.user when x-is-vk-token=true', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    vkService.verifyVkToken.mockResolvedValue({ sub: '42' } as any);
    const leanExec = jest.fn().mockResolvedValue({
      id: 'user-db-id',
      name: 'Vk User',
      email: 'vk@example.com',
      picture: 'https://vk.com/pic.jpg',
    });
    userModel.findOne.mockReturnValue({ lean: () => ({ exec: leanExec }) });

    const ctx = makeCtx({ authorization: 'vk-id-token', 'x-is-vk-token': 'true' });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(vkService.verifyVkToken).toHaveBeenCalledWith('vk-id-token');
    const req = (ctx as any)._req;
    expect(req.user.id).toBe('user-db-id');
  });

  it('throws UnauthorizedException when VK user not found in DB', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    vkService.verifyVkToken.mockResolvedValue({ sub: '42' } as any);
    const leanExec = jest.fn().mockResolvedValue(null);
    userModel.findOne.mockReturnValue({ lean: () => ({ exec: leanExec }) });

    const ctx = makeCtx({ authorization: 'vk-id-token', 'x-is-vk-token': 'true' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when VK token verification fails', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    vkService.verifyVkToken.mockRejectedValue(new Error('bad token'));

    const ctx = makeCtx({ authorization: 'vk-id-token', 'x-is-vk-token': 'true' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
