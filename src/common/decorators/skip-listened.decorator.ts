import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SkipListened = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): boolean => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.headers['skip-listened'] === 'true';
  },
);
