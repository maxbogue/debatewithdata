import { ValidationError } from '../common/validate';

class ApiError extends Error {}

export class ClientError extends ApiError {
  constructor(message) {
    super(message);
    this.httpStatus = 400;
    this.name = 'ClientError';
  }
}

export class AuthError extends ApiError {
  constructor(message) {
    super(message);
    this.httpStatus = 401;
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message) {
    super(message);
    this.httpStatus = 403;
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message) {
    super(message);
    this.httpStatus = 404;
    this.name = 'NotFoundError';
  }
}

export function apiErrorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    res.status(err.httpStatus).json({ message: err.message });
  } else if (err instanceof ValidationError) {
    res.status(400).json({ message: err.message });
  } else {
    next(err);
  }
}
