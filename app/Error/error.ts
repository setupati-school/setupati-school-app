// errors.ts
export enum HttpCode {
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  INTERNAL_SERVER_ERROR = 500
}

export class AppError extends Error {
  public readonly httpCode: HttpCode;
  public readonly isOperational: boolean;
  constructor(message: string, httpCode: HttpCode, isOperational = true) {
    super();
    this.message = message;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
