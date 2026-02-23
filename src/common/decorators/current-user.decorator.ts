import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfo } from '../interfaces/user-info.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserInfo => {
    return ctx.switchToHttp().getRequest<Request & { user: UserInfo }>().user;
  },
);
