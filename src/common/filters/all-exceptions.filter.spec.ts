import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function makeHost(statusFn: jest.Mock, jsonFn: jest.Mock) {
  const res = { status: statusFn.mockReturnThis(), json: jsonFn };
  const req = { method: 'GET', url: '/test' };
  const httpCtx = { getResponse: () => res, getRequest: () => req };
  return {
    switchToHttp: () => httpCtx,
  } as unknown as ArgumentsHost;
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    host = makeHost(statusMock, jsonMock);
  });

  it('handles HttpException with string body', () => {
    const exc = new HttpException('Not found', HttpStatus.NOT_FOUND);
    filter.catch(exc, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ message: 'Not found' }),
      }),
    );
  });

  it('handles HttpException with object body (ValidationPipe format)', () => {
    const exc = new HttpException(
      { statusCode: 400, message: ['name must be a string', 'email is invalid'], error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exc, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const body = jsonMock.mock.calls[0][0];
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('Bad Request');
    expect(body.error.message).toBe('name must be a string; email is invalid');
    expect(body.error.details).toEqual(['name must be a string', 'email is invalid']);
  });

  it('handles HttpException with object body and single message string', () => {
    const exc = new HttpException(
      { statusCode: 403, message: 'Forbidden resource', error: 'Forbidden' },
      HttpStatus.FORBIDDEN,
    );
    filter.catch(exc, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    const body = jsonMock.mock.calls[0][0];
    expect(body.error.message).toBe('Forbidden resource');
    expect(body.error.details).toBeUndefined();
  });

  it('handles unknown exception (non-HttpException) with 500', () => {
    const exc = new Error('Unexpected error');
    filter.catch(exc, host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = jsonMock.mock.calls[0][0];
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('Something went wrong');
  });

  it('handles non-Error unknown exception', () => {
    filter.catch('some string exception', host);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(jsonMock.mock.calls[0][0].ok).toBe(false);
  });
});
