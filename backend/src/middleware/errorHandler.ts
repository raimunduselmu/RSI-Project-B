import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { AppError } from '../lib/AppError.js';
import { isProd } from '../config/env.js';

export const notFound: RequestHandler = (_req, _res, next) => next(new AppError('ERR-DATA-01', 'Endpoint tidak ditemukan'));

 
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let e: AppError;
  if (err instanceof AppError) e = err;
  else if (err instanceof multer.MulterError) e = new AppError('ERR-FILE-01');
  else if (typeof err?.message === 'string' && /ERR-[A-Z]+-\d{2}/.test(err.message)) {
    // galat dari THROW di stored procedure / trigger, contoh 'ERR-DATA-04'
    const code = err.message.match(/ERR-[A-Z]+-\d{2}/)![0];
    try { e = new AppError(code as never); } catch { e = new AppError('ERR-SYS-01'); }
  } else {
    console.error(err);
    e = new AppError('ERR-SYS-01');
  }
  res.status(e.status).json({
    status: 'error',
    error_code: e.code,
    message: e.message,
    ...(e.details ? { details: e.details } : {}),
    ...(!isProd && !(err instanceof AppError) ? { debug: String(err?.message ?? err) } : {}),
  });
};
