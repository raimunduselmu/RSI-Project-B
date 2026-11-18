import type { RoleName } from '../config/constants.js';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  roles: RoleName[];
  mustChangePassword: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
export {};
