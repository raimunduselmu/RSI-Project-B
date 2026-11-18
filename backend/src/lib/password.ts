import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const hashPassword = (plain: string) => bcrypt.hash(plain, env.BCRYPT_COST);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

/** Password sementara untuk akun baru / reset oleh Admin, contoh: Kmk-7x2Q9a */
export function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const rand = Array.from(crypto.randomBytes(7), (b) => chars[b % chars.length]).join('');
  return `Kmk-${rand}`;
}
