// Mencari aset berdasarkan UUID atau kode unik (ELEC-120326). Dipakai modul inventaris gelombang 4.
import { AppError } from './AppError.js';
import { query, type sql } from './sql.js';

export interface AssetRef {
  asset_id: string;
  asset_code: string;
  asset_name: string;
  status: string;
  asset_condition: string;
  location_text: string;
  category_id: number;
}

export async function findAsset(key: string, tx?: sql.Transaction): Promise<AssetRef> {
  const rows = await query<AssetRef>(
    `SELECT asset_id, asset_code, asset_name, status, asset_condition, location_text, category_id
     FROM assets WHERE (asset_id = TRY_CAST(@key AS UNIQUEIDENTIFIER) OR asset_code = @key) AND is_deleted = 0`,
    { key },
    tx,
  );
  if (!rows[0]) throw new AppError('ERR-DATA-01', 'Aset tidak ditemukan');
  return rows[0];
}

/** Catat aksi non-CRUD ke audit_logs (LABEL_PRINTED, DATA_EXPORTED, DOCUMENT_UPLOADED/DELETED). Tidak melempar galat. */
export async function writeAudit(
  a: { userId?: string | null; username?: string | null; action: string; resourceType: string; resourceId?: string | null; detail?: unknown; ip?: string | null },
) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, user_email, action_type, resource_type, resource_id, new_values, ip_address)
       VALUES (@u, @un, @a, @rt, @rid, @nv, @ip)`,
      {
        u: a.userId ?? null,
        un: a.username ?? null,
        a: a.action,
        rt: a.resourceType,
        rid: a.resourceId ? String(a.resourceId).slice(0, 100) : null,
        nv: a.detail === undefined ? null : JSON.stringify(a.detail),
        ip: a.ip ?? null,
      },
    );
  } catch (e) {
    console.error('[audit] gagal mencatat', a.action, e);
  }
}

/** Ubah Date/'YYYY-MM-DD' dari driver menjadi string tanggal */
export const ymd = (v: unknown) => (v == null ? null : v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10));
