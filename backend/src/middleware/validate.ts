import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../lib/AppError.js';

type Part = 'body' | 'query' | 'params';

/** Validasi request dengan skema Zod; hasil parse menggantikan nilai asli. */
export const validate =
  (schema: ZodTypeAny, part: Part = 'body'): RequestHandler =>
  (req, _res, next) => {
    const r = schema.safeParse(req[part]);
    if (!r.success) return next(new AppError('ERR-VAL-01', undefined, r.error.flatten().fieldErrors));
    Object.assign(req, { [part]: r.data });
    next();
  };
