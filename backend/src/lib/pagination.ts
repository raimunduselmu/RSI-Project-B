import type { Request } from 'express';
import { PAGINATION } from '../config/constants.js';

export function getPagination(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.min(PAGINATION.MAX, Math.max(1, Number(req.query.per_page) || PAGINATION.DEFAULT));
  return { page, perPage, offset: (page - 1) * perPage };
}
