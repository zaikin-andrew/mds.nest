import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

function makeCtx(): ExecutionContext {
  return {} as ExecutionContext;
}

function makeHandler(value: unknown): CallHandler {
  return { handle: () => of(value) };
}

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('wraps plain data in {ok, data}', (done) => {
    interceptor.intercept(makeCtx(), makeHandler('hello')).subscribe((result) => {
      expect(result).toEqual({ ok: true, data: 'hello' });
      done();
    });
  });

  it('extracts items from {items} shape', (done) => {
    const items = [{ id: '1' }, { id: '2' }];
    interceptor.intercept(makeCtx(), makeHandler({ items })).subscribe((result) => {
      expect(result).toEqual({ ok: true, data: items });
      done();
    });
  });

  it('extracts items and meta from paginated result', (done) => {
    const items = [{ id: '1' }];
    const meta = { total: 1, page: 1, limit: 20, pages: 1 };
    interceptor.intercept(makeCtx(), makeHandler({ items, meta })).subscribe((result) => {
      expect(result).toEqual({ ok: true, data: items, meta });
      done();
    });
  });

  it('handles null response', (done) => {
    interceptor.intercept(makeCtx(), makeHandler(null)).subscribe((result) => {
      expect(result).toEqual({ ok: true, data: null });
      done();
    });
  });

  it('handles object without items (non-paginated object)', (done) => {
    const data = { id: 'abc', name: 'test' };
    interceptor.intercept(makeCtx(), makeHandler(data)).subscribe((result) => {
      // No items key → the whole object is data
      expect(result).toEqual({ ok: true, data });
      done();
    });
  });

  it('handles numeric response', (done) => {
    interceptor.intercept(makeCtx(), makeHandler(42)).subscribe((result) => {
      expect(result).toEqual({ ok: true, data: 42 });
      done();
    });
  });
});
