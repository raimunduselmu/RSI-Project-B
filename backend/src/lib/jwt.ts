import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  sub: string;           // user_id
  username: string;
  roles: string[];
  tv: number;            // token_version (TSD 6.2)
}

export const signToken = (p: TokenPayload) =>
  jwt.sign(p, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as TokenPayload & { iat: number; exp: number };
