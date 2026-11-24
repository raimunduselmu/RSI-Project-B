// FSD-2.5, 2.7, 2.8 — CRUD aset memakai query berparameter; riwayat perubahan dicatat trigger trg_asset_history
import { AppError } from '../../lib/AppError.js';
import { query, withTransaction } from '../../lib/sql.js';
import type { AuthUser } from '../../types/express.js';
import type { CreateAssetInput, ListAssetQuery, UpdateAssetInput } from './assets.schema.js';

const PUBLIC_COLS = `a.asset_id, a.asset_code, a.asset_name, a.category_id, c.category_name, a.location_text,
  a.asset_condition, a.status, a.is_lendable, CASE WHEN a.photo_path IS NULL THEN 0 ELSE 1 END AS has_photo`;
const FULL_COLS = `${PUBLIC_COLS}, a.source_type, a.donor_name, a.acquired_date, a.acquisition_value, a.description,
  a.photo_path, a.created_at, a.updated_at, u.full_name AS created_by_name`;

const FROM = `FROM assets a
  JOIN asset_categories c ON c.category_id = a.category_id
  LEFT JOIN users u ON u.user_id = a.created_by`;

/** Cocokkan :id sebagai UUID atau kode aset */
const KEY_WHERE = `(a.asset_id = TRY_CAST(@key AS UNIQUEIDENTIFIER) OR a.asset_code = @key) AND a.is_deleted = 0`;

export async function list(q: ListAssetQuery, full: boolean, page: number, perPage: number) {
  const where = [`a.is_deleted = 0`];
  const params: Record<string, unknown> = { offset: (page - 1) * perPage, limit: perPage };
  if (!full) where.push(`a.is_lendable = 1 AND a.status NOT IN (N'HILANG', N'NONAKTIF')`); // publik: katalog yang bisa dipinjam
  if (q.q) { where.push(`(a.asset_code LIKE @q OR a.asset_name LIKE @q)`); params.q = `%${q.q}%`; }
  if (q.category_id) { where.push(`a.category_id = @cat`); params.cat = q.category_id; }
  if (q.status) { where.push(`a.status = @status`); params.status = q.status; }
  const w = `WHERE ${where.join(' AND ')}`;

  const rows = await query(`SELECT ${full ? FULL_COLS : PUBLIC_COLS} ${FROM} ${w}
    ORDER BY a.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`, params);
  const total = await query<{ total: number }>(`SELECT COUNT(*) AS total ${FROM} ${w}`, params);
  return { rows, total: total[0]?.total ?? 0 };
}

export async function get(key: string, full: boolean) {
  const rows = await query(`SELECT ${full ? FULL_COLS : PUBLIC_COLS} ${FROM} WHERE ${KEY_WHERE}`, { key });
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Aset tidak ditemukan');
  return rows[0];
}

/** Pratinjau kode unik yang akan dibuat hari ini (FSD-2.5, SCR-06) */
export async function previewCode(categoryId: number) {
  const rows = await query<{ code: string | null }>(
    `SELECT dbo.fn_generate_asset_code(@cat, CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE)) AS code`,
    { cat: categoryId },
  );
  if (!rows[0]?.code) throw new AppError('ERR-DATA-01', 'Kategori tidak ditemukan');
  return { asset_code: rows[0].code };
}

/** Registrasi aset + kode unik otomatis (BR-10) + riwayat REGISTRASI, dalam satu transaksi */
export async function create(input: CreateAssetInput, user: AuthUser, ip?: string, photoPath?: string) {
  return withTransaction(user, ip, async (tx) => {
    // Kunci agar dua registrasi bersamaan tidak mendapat kode yang sama
    await query(`EXEC sp_getapplock @Resource = N'asset_code', @LockMode = N'Exclusive', @LockOwner = N'Transaction'`, {}, tx);
    const cat = await query(`SELECT category_id FROM asset_categories WHERE category_id = @cat`, { cat: input.category_id }, tx);
    if (!cat[0]) throw new AppError('ERR-VAL-01', 'Kategori tidak ditemukan', { category_id: ['Kategori tidak ditemukan'] });

    const rows = await query<{ asset_id: string; asset_code: string }>(
      `DECLARE @code NVARCHAR(30) = dbo.fn_generate_asset_code(@cat, CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE));
       INSERT INTO assets (asset_code, asset_name, category_id, location_text, asset_condition, status, is_lendable,
                           source_type, donor_name, acquired_date, acquisition_value, description, photo_path, created_by)
       OUTPUT inserted.asset_id, inserted.asset_code
       VALUES (@code, @name, @cat, @loc, @cond, N'TERSEDIA', @lendable, @source, @donor, @acq, @value, @desc, @photo, @uid)`,
      {
        cat: input.category_id, name: input.asset_name, loc: input.location_text, cond: input.asset_condition,
        lendable: input.is_lendable, source: input.source_type, donor: input.source_type === 'KAS' ? null : input.donor_name ?? null,
        acq: input.acquired_date, value: input.acquisition_value ?? null, desc: input.description ?? null,
        photo: photoPath ?? null, uid: user.id,
      },
      tx,
    );
    const a = rows[0];
    await query(
      `INSERT INTO asset_histories (asset_id, event_type, new_value, note, actor_user_id, actor_name)
       VALUES (@id, N'REGISTRASI', @nv, @note, @uid, @uname)`,
      {
        id: a.asset_id,
        nv: JSON.stringify({ kode: a.asset_code, lokasi: input.location_text, kondisi: input.asset_condition, sumber: input.source_type }),
        note: input.source_type === 'KAS' ? 'Didaftarkan' : `Didaftarkan · ${input.source_type} dari ${input.donor_name}`,
        uid: user.id, uname: user.fullName,
      },
      tx,
    );
    return a;
  });
}

const UPDATABLE = ['asset_name', 'category_id', 'location_text', 'asset_condition', 'status', 'is_lendable', 'source_type',
  'donor_name', 'acquired_date', 'acquisition_value', 'description'] as const;

/** Ubah data aset. Kode unik tidak bisa diubah. Riwayat lokasi/kondisi/status dicatat trigger. */
export async function update(key: string, input: UpdateAssetInput, user: AuthUser, ip?: string, photoPath?: string) {
  return withTransaction(user, ip, async (tx) => {
    const cur = await query<{ asset_id: string; status: string; source_type: string; donor_name: string | null }>(
      `SELECT a.asset_id, a.status, a.source_type, a.donor_name FROM assets a WITH (UPDLOCK, ROWLOCK) WHERE ${KEY_WHERE}`, { key }, tx);
    const a = cur[0];
    if (!a) throw new AppError('ERR-DATA-01', 'Aset tidak ditemukan');
    if (input.status && input.status !== a.status && (a.status === 'DIPINJAM' || a.status === 'DIGUNAKAN')) {
      throw new AppError('ERR-VAL-01', 'Aset sedang dipinjam/dipakai; status berubah lewat proses pengembalian', { status: ['Tidak bisa diubah manual'] });
    }
    const source = input.source_type ?? a.source_type;
    const donor = input.donor_name !== undefined ? input.donor_name : a.donor_name;
    if (source !== 'KAS' && !donor) throw new AppError('ERR-VAL-01', undefined, { donor_name: ['Wajib diisi bila sumber DONASI/HIBAH'] });

    const data: Record<string, unknown> = { ...input };
    if (source === 'KAS') data.donor_name = null;
    const keys = UPDATABLE.filter((k) => data[k] !== undefined);
    if (photoPath) { keys.push('photo_path' as never); data.photo_path = photoPath; }
    if (keys.length === 0) throw new AppError('ERR-VAL-01', 'Tidak ada data yang diubah');

    const params: Record<string, unknown> = { id: a.asset_id };
    for (const k of keys) params[k] = data[k];
    await query(`UPDATE assets SET ${keys.map((k) => `${k} = @${k}`).join(', ')}, updated_at = SYSUTCDATETIME() WHERE asset_id = @id`, params, tx);
    return { asset_id: a.asset_id };
  });
}

/** Hapus = soft delete (FSD-2.5). Aset yang sedang dipinjam tidak boleh dihapus. */
export async function remove(key: string, user: AuthUser, ip?: string) {
  return withTransaction(user, ip, async (tx) => {
    const cur = await query<{ asset_id: string; status: string }>(`SELECT a.asset_id, a.status FROM assets a WHERE ${KEY_WHERE}`, { key }, tx);
    if (!cur[0]) throw new AppError('ERR-DATA-01', 'Aset tidak ditemukan');
    if (cur[0].status === 'DIPINJAM') throw new AppError('ERR-DATA-03', 'Aset sedang dipinjam dan tidak dapat dihapus');
    await query(`UPDATE assets SET is_deleted = 1, updated_at = SYSUTCDATETIME() WHERE asset_id = @id`, { id: cur[0].asset_id }, tx);
  });
}

/** Riwayat keterlacakan aset, terbaru di atas (FSD-2.8) */
export async function histories(key: string, range: { date_from?: string; date_to?: string } = {}) {
  const a = await query<{ asset_id: string }>(`SELECT a.asset_id FROM assets a WHERE ${KEY_WHERE}`, { key });
  if (!a[0]) throw new AppError('ERR-DATA-01', 'Aset tidak ditemukan');
  const rows = await query<Record<string, unknown> & { old_value: string | null; new_value: string | null }>(
    `SELECT history_id, event_type, old_value, new_value, note, actor_name, created_at
     FROM asset_histories
     WHERE asset_id = @id
       AND (@df IS NULL OR CAST(DATEADD(HOUR, 7, created_at) AS date) >= @df)
       AND (@dt IS NULL OR CAST(DATEADD(HOUR, 7, created_at) AS date) <= @dt)
     ORDER BY created_at DESC`,
    { id: a[0].asset_id, df: range.date_from ?? null, dt: range.date_to ?? null },
  );
  return rows.map((r) => ({ ...r, old_value: r.old_value ? JSON.parse(r.old_value) : null, new_value: r.new_value ? JSON.parse(r.new_value) : null }));
}

/** Path foto aset (relatif terhadap UPLOAD_DIR) */
export async function photoPath(key: string) {
  const rows = await query<{ photo_path: string | null }>(`SELECT a.photo_path FROM assets a WHERE ${KEY_WHERE}`, { key });
  if (!rows[0]?.photo_path) throw new AppError('ERR-DATA-01', 'Foto aset tidak ada');
  return rows[0].photo_path;
}
