// TSD 4 — table 1 roles, table 2 users, table 3 user_roles
import { sql } from 'drizzle-orm';
import { bit, datetime2, int, mssqlTable, nvarchar } from 'drizzle-orm/mssql-core';
import { uniqueidentifier } from './_types.js';

export const roles = mssqlTable('roles', {
  roleId: int('role_id').primaryKey().identity(),
  roleName: nvarchar('role_name', { length: 20 }).notNull().unique(),
  description: nvarchar('description', { length: 'max' }),
});

export const users = mssqlTable('users', {
  userId: uniqueidentifier('user_id').primaryKey().default(sql`NEWID()`),
  fullName: nvarchar('full_name', { length: 100 }).notNull(),
  username: nvarchar('username', { length: 50 }).notNull().unique(),
  email: nvarchar('email', { length: 150 }),
  phone: nvarchar('phone', { length: 20 }),
  division: nvarchar('division', { length: 100 }),
  passwordHash: nvarchar('password_hash', { length: 255 }).notNull(),
  mustChangePassword: bit('must_change_password').notNull().default(true),
  isActive: bit('is_active').notNull().default(true),
  failedAttempts: int('failed_attempts').notNull().default(0),
  lockedUntil: datetime2('locked_until'),
  tokenVersion: int('token_version').notNull().default(0),
  lastLoginAt: datetime2('last_login_at'),
  createdAt: datetime2('created_at').notNull().default(sql`SYSUTCDATETIME()`),
  updatedAt: datetime2('updated_at').notNull().default(sql`SYSUTCDATETIME()`),
});

export const userRoles = mssqlTable('user_roles', {
  userRoleId: uniqueidentifier('user_role_id').primaryKey().default(sql`NEWID()`),
  userId: uniqueidentifier('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  roleId: int('role_id').notNull().references(() => roles.roleId),
  officerId: uniqueidentifier('officer_id'),          // FK → officers (organization.ts)
  grantedAt: datetime2('granted_at').notNull().default(sql`SYSUTCDATETIME()`),
  revokedAt: datetime2('revoked_at'),
});

// TODO (TSD 4): permissions, role_permissions
