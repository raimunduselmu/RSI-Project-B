import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as c from './auth.controller.js';
import { changePasswordSchema, loginSchema } from './auth.schema.js';

export const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), c.login);                       // FSD-2.1
authRoutes.post('/logout', requireAuth, c.logout);                               // FSD-2.2
authRoutes.get('/me', requireAuth, c.me);                                        // FSD-2.1
authRoutes.patch('/password', requireAuth, validate(changePasswordSchema), c.changePassword); // FSD-2.3
