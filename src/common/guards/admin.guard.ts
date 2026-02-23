import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly appConfig: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const username = (req.headers['x-auth-username'] as string) || '';
    const password = (req.headers['x-auth-password'] as string) || '';

    const isValid = this.appConfig.adminCredentials.some(
      (cred) => cred.username === username && cred.password === password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    return true;
  }
}
