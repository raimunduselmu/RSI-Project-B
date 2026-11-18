import { ERR, type ErrorCode } from './errors.js';

export class AppError extends Error {
  readonly status: number;
  constructor(
    readonly code: ErrorCode,
    message?: string,
    readonly details?: unknown,
  ) {
    super(message ?? ERR[code].message);
    this.status = ERR[code].status;
  }
}
