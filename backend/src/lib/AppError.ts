import { ERR, type ErrorCode } from './errors.js';

/**
 * Galat aplikasi (TSD 3.3). Enkapsulasi: code/status/details readonly; status diturunkan dari katalog ERR.
 * Dikirim ke klien lewat toResponse() di middleware/errorHandler.ts.
 */
export class AppError extends Error {
  readonly status: number;
  constructor(
    readonly code: ErrorCode,
    message?: string,
    readonly details?: unknown,
  ) {
    super(message ?? ERR[code].message);
    this.name = 'AppError';
    this.status = ERR[code].status;
  }

  /** Bentuk response JSON standar { status, error_code, message, details? } */
  toResponse(): Record<string, unknown> {
    return {
      status: 'error',
      error_code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

/**
 * Galat validasi isian form (ERR-VAL-01) dari middleware/validate.ts.
 * Overriding: toResponse() milik AppError ditimpa untuk menambah petunjuk bagi form.
 */
export class ValidationError extends AppError {
  constructor(details: Record<string, string[] | undefined>, message?: string, code: ErrorCode = 'ERR-VAL-01') {
    super(code, message, details);
    this.name = 'ValidationError';
  }

  override toResponse(): Record<string, unknown> {
    return { ...super.toResponse(), hint: 'Periksa kembali isian yang ditandai merah' };
  }
}
