import type { RequestHandler } from 'express';
import type { ZodIssue, ZodTypeAny } from 'zod';
import { ValidationError } from '../lib/AppError.js';
import type { ErrorCode } from '../lib/errors.js';

type Part = 'body' | 'query' | 'params';

/** Field waktu yang galat urutan/rentangnya dilaporkan sebagai ERR-VAL-04 (FSD Bagian 6) */
const TIME_FIELDS = new Set(['end_at', 'planned_end_at', 'start_at', 'date_to', 'end_date', 'occurred_date']);
const AMOUNT_FIELDS = new Set(['amount', 'planned_amount', 'nominal']);

function valueAt(src: unknown, path: (string | number)[]): unknown {
  let v: unknown = src;
  for (const k of path) {
    if (v == null || typeof v !== 'object') return undefined;
    v = (v as Record<string | number, unknown>)[k];
  }
  return v;
}

const isEmpty = (v: unknown) =>
  v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

/**
 * Memilih kode galat validasi yang paling spesifik (FSD Bagian 6):
 * isian wajib kosong → ERR-VAL-01; email → 02; telepon → 03; urutan waktu → 04;
 * password lemah → 06; konfirmasi beda → 07; nominal ≤ 0 → 08; selain itu → 01.
 */
export function pickCode(issues: ZodIssue[], src: unknown): ErrorCode {
  if (issues.some((i) => isEmpty(valueAt(src, i.path)) && i.code !== 'custom')) return 'ERR-VAL-01';
  for (const i of issues) {
    const field = String(i.path[i.path.length - 1] ?? '');
    if (field.includes('email')) return 'ERR-VAL-02';
    if (field.includes('phone')) return 'ERR-VAL-03';
    if (field === 'new_password') return 'ERR-VAL-06';
    if (field === 'confirm_password') return 'ERR-VAL-07';
    if (AMOUNT_FIELDS.has(field)) return 'ERR-VAL-08';
    if (TIME_FIELDS.has(field)) return 'ERR-VAL-04';
  }
  return 'ERR-VAL-01';
}

/** Validasi request dengan skema Zod; hasil parse menggantikan nilai asli. */
export const validate =
  (schema: ZodTypeAny, part: Part = 'body'): RequestHandler =>
  (req, _res, next) => {
    const r = schema.safeParse(req[part]);
    if (!r.success) {
      const code = pickCode(r.error.issues, req[part]);
      return next(new ValidationError(r.error.flatten().fieldErrors, undefined, code));
    }
    Object.assign(req, { [part]: r.data });
    next();
  };
