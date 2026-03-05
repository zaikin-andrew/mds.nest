import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AppConfigService } from 'src/config/config.service';

function makeCtx(headers: Record<string, string>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let configService: Partial<AppConfigService>;

  beforeEach(() => {
    configService = {
      adminCredentials: [
        { username: 'admin', password: 'secret' },
        { username: 'moderator', password: 'pass123' },
      ],
    };
    guard = new AdminGuard(configService as AppConfigService);
  });

  it('allows request with valid first-admin credentials', () => {
    const ctx = makeCtx({ 'x-auth-username': 'admin', 'x-auth-password': 'secret' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows request with valid second-admin credentials', () => {
    const ctx = makeCtx({ 'x-auth-username': 'moderator', 'x-auth-password': 'pass123' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects request with wrong password', () => {
    const ctx = makeCtx({ 'x-auth-username': 'admin', 'x-auth-password': 'wrong' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects request with wrong username', () => {
    const ctx = makeCtx({ 'x-auth-username': 'unknown', 'x-auth-password': 'secret' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects request with missing headers', () => {
    const ctx = makeCtx({});
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects request with empty credentials', () => {
    const ctx = makeCtx({ 'x-auth-username': '', 'x-auth-password': '' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
