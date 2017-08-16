class ApiError extends Error {}

export class ClientError extends ApiError {
  constructor(message) {
    super(message);
    this.httpStatus = 400;
    this.name = 'ClientError';
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
  } else {
    next();
  }
}
