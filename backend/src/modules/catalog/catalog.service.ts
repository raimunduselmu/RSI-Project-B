import { AppError } from '../../lib/AppError.js';
import { isUniqueViolation, query } from '../../lib/sql.js';
import type { CreateCategoryInput, CreateRoomInput, UpdateCategoryInput, UpdateRoomInput } from './catalog.schema.js';

/** Bangun "SET a = @a, b = @b" hanya untuk field yang dikirim */
function buildSet(input: Record<string, unknown>, allowed: string[]) {
  const keys = allowed.filter((k) => input[k] !== undefined);
  const params: Record<string, unknown> = {};
  for (const k of keys) params[k] = input[k];
  return { sql: keys.map((k) => `${k} = @${k}`).join(', '), params, empty: keys.length === 0 };
}

/* ---------------- Kategori aset ---------------- */
export const listCategories = () =>
  query(`SELECT category_id, category_code, category_name, maintenance_default_days,
                (SELECT COUNT(*) FROM assets a WHERE a.category_id = c.category_id AND a.is_deleted = 0) AS asset_count
         FROM asset_categories c ORDER BY category_name`);

export async function createCategory(input: CreateCategoryInput) {
  try {
    const rows = await query(
      `INSERT INTO asset_categories (category_code, category_name, maintenance_default_days)
       OUTPUT inserted.*
       VALUES (@code, @name, @days)`,
      { code: input.category_code, name: input.category_name, days: input.maintenance_default_days ?? null },
    );
    return rows[0];
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', 'Kode kategori sudah dipakai');
    throw e;
  }
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  const set = buildSet(input, ['category_name', 'maintenance_default_days']);
  if (set.empty) throw new AppError('ERR-VAL-01', 'Tidak ada data yang diubah');
  const rows = await query(`UPDATE asset_categories SET ${set.sql} OUTPUT inserted.* WHERE category_id = @id`, { ...set.params, id });
  if (!rows[0]) throw new AppError('ERR-DATA-01');
  return rows[0];
}

/* ---------------- Ruangan ---------------- */
export const listRooms = (includeInactive: boolean) =>
  query(`SELECT room_id, room_name, capacity, description, is_active FROM rooms
         ${includeInactive ? '' : 'WHERE is_active = 1'} ORDER BY room_name`);

export async function createRoom(input: CreateRoomInput) {
  try {
    const rows = await query(
      `INSERT INTO rooms (room_name, capacity, description, is_active)
       OUTPUT inserted.*
       VALUES (@name, @capacity, @description, @active)`,
      { name: input.room_name, capacity: input.capacity ?? null, description: input.description ?? null, active: input.is_active ?? true },
    );
    return rows[0];
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', 'Nama ruangan sudah dipakai');
    throw e;
  }
}

export async function updateRoom(id: number, input: UpdateRoomInput) {
  const set = buildSet(input, ['room_name', 'capacity', 'description', 'is_active']);
  if (set.empty) throw new AppError('ERR-VAL-01', 'Tidak ada data yang diubah');
  try {
    const rows = await query(`UPDATE rooms SET ${set.sql} OUTPUT inserted.* WHERE room_id = @id`, { ...set.params, id });
    if (!rows[0]) throw new AppError('ERR-DATA-01');
    return rows[0];
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError('ERR-DATA-02', 'Nama ruangan sudah dipakai');
    throw e;
  }
}
