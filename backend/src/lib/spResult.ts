import { AppError } from './AppError.js';
import type { ErrorCode } from './errors.js';

type ResultMap = Record<string, [ErrorCode, string?, Record<string, string[]>?]>;

/**
 * Ubah kode @result dari stored procedure menjadi AppError.
 * Contoh: failResult(output.result, { DUE_NOT_OPEN: ['ERR-KAS-01'] })
 */
export function failResult(result: unknown, map: ResultMap): never {
  const m = map[String(result)];
  if (m) throw new AppError(m[0], m[1], m[2]);
  throw new AppError('ERR-SYS-01', `Hasil prosedur tidak dikenal: ${String(result)}`);
}
