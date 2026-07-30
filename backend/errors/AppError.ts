// Holds shared info like message and statusCode

class AppError extends Error {
  readonly statusCode: number;

  constructor(msg: string, statusCode: number) {
    super(msg);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };
