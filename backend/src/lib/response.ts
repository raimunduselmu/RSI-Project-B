import type { Response } from 'express';

// Envelope seragam (TSD 3.1)
export const ok = <T>(res: Response, data: T, message?: string, meta?: unknown) =>
  res.status(200).json({ status: 'success', data, ...(message && { message }), ...(meta ? { meta } : {}) });

export const created = <T>(res: Response, data: T, message?: string) =>
  res.status(201).json({ status: 'success', data, ...(message && { message }) });

export const paginated = <T>(res: Response, data: T[], page: number, perPage: number, total: number) =>
  ok(res, data, undefined, { current_page: page, per_page: perPage, total, last_page: Math.max(1, Math.ceil(total / perPage)) });
