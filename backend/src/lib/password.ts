import { randomInt } from 'node:crypto';
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

/** Password sementara 10 karakter: ada huruf besar, kecil, dan angka (BR-05), tanpa karakter yang mirip (0/O, 1/l) */
export function tempPassword() {
  const pick = (set: string, n: number) => Array.from({ length: n }, () => set[randomInt(set.length)]);
  const chars = [...pick('ABCDEFGHJKLMNPQRSTUVWXYZ', 2), ...pick('abcdefghijkmnpqrstuvwxyz', 5), ...pick('23456789', 3)];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

