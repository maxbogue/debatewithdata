import { NextFunction, Request, Response } from 'express';

import { ValidationError } from '@/common/validate';

class ApiError extends Error {
  readonly httpStatus: number;
  readonly name: string;

  constructor(message: string, httpStatus: number, name: string) {
    super(message);
    this.httpStatus = httpStatus;
    this.name = name;
  }

  toJson(): object {
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
  readonly data: object;

  constructor(message: string, data: object) {
    super(message, 409, 'ConflictError');
    this.data = data;
  }

  toJson(): object {
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
