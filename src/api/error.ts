import { ValidationError } from '@/common/validate';
import { NextFunction, Request, Response } from 'express';

class ApiError extends Error {
  constructor(message: string, public httpStatus: number, public name: string) {
    super(message);
  }
  public toJson(): object {
    return { message: this.message };
  }
}

export class ClientError extends ApiError {
  constructor(message: string) {
    super(message, 400, 'ClientError');
  }
}

export class AuthError extends ApiError {
  constructor(message: string) {
    super(message, 401, 'AuthError');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string) {
    super(message, 403, 'ForbiddenError');
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404, 'NotFoundError');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, public data: object) {
    super(message, 409, 'ConflictError');
  }

  public toJson(): object {
    return {
      ...super.toJson(),
      data: this.data,
    };
  }
}

export function apiErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError) {
    res.status(err.httpStatus).json(err.toJson());
  } else if (err instanceof ValidationError) {
    res.status(400).json({ message: err.message });
  } else {
    next(err);
  }
}
