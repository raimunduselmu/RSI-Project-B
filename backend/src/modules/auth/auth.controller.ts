import type { CookieOptions } from 'express';
import { COOKIE_NAME } from '../../config/constants.js';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { ok } from '../../lib/response.js';
import * as service from './auth.service.js';

const cookieOpts: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.COOKIE_SECURE,
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
};

export const login = asyncHandler(async (req, res) => {
  const { token, user } = await service.login(req.body, req.ip);
  res.cookie(COOKIE_NAME, token, cookieOpts);
  ok(res, { user });
});

export const logout = asyncHandler(async (req, res) => {
  await service.logout(req.user!.id, req.ip);
  res.clearCookie(COOKIE_NAME, { ...cookieOpts, maxAge: undefined });
  ok(res, null, 'Logout berhasil');
});

export const me = asyncHandler(async (req, res) => {
  const u = req.user!;
  ok(res, { id: u.id, username: u.username, full_name: u.fullName, roles: u.roles, must_change_password: u.mustChangePassword });
});

export const changePassword = asyncHandler(async (req, res) => {
  await service.changePassword(req.user!.id, req.body);
  // token_version naik → minta login ulang
  res.clearCookie(COOKIE_NAME, { ...cookieOpts, maxAge: undefined });
  ok(res, null, 'Password berhasil diubah. Silakan login kembali.');
});
