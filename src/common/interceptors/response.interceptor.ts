import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  unknown,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const obj =
          data != null && typeof data === 'object'
            ? (data as Record<string, unknown>)
            : null;

        return {
          ok: true as const,
          data: (obj?.items ?? data) as T,
          ...(obj?.meta ? { meta: obj.meta as ApiResponse<T>['meta'] } : {}),
        };
      }),
    );
  }
}
