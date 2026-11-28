// FSD-2.23: Daftar & pencarian data umat
// TSD Bagian 4: Table 27 - members
//
// Service bertanggung jawab atas query database.
// Controller tidak boleh berisi SQL atau logika pencarian.
//
// Data yang dikembalikan hanya berasal dari umat yang
// belum di-soft-delete. Data lengkap tetap dilindungi RBAC.

import { query } from '../../lib/sql.js';
import type { ListMembersQuery } from './members.schema.js';

interface MemberListRow {
  member_id: string;
  full_name: string;
  member_category: string;
  nim_nip: string | null;
  status: string;
  consent_given: boolean;
  show_in_directory: boolean;
  entry_year: number | null;
}

interface CountRow {
  total: number | string;
}

/**
 * Escape karakter khusus LIKE agar input pencarian
 * diperlakukan sebagai teks biasa, bukan pola SQL.
 */
function escapeLike(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('%', '\\%')
    .replaceAll('_', '\\_')
    .replaceAll('[', '\\[');
}

/**
 * FSD-2.23:
 * Menampilkan daftar umat dengan pencarian, filter kategori/status,
 * serta paginasi.
 *
 * BR-57:
 * Endpoint ini hanya dapat diakses role yang berwenang.
 *
 * BR-58:
 * Data is_deleted = 1 tidak ditampilkan.
 */
export async function listMembers(input: ListMembersQuery) {
  const search = input.q
    ? `%${escapeLike(input.q)}%`
    : null;

  const filters = {
    search,
    category: input.member_category ?? null,
    status: input.status ?? null,
  };

  // WHERE dibuat sama untuk query data dan query total,
  // sehingga metadata paginasi konsisten dengan filter.
  const where = `
    WHERE is_deleted = 0
      AND (
        @search IS NULL
        OR full_name LIKE @search ESCAPE '\\'
        OR nim_nip LIKE @search ESCAPE '\\'
      )
      AND (
        @category IS NULL
        OR member_category = @category
      )
      AND (
        @status IS NULL
        OR status = @status
      )
  `;

  const [countRows, dataRows] = await Promise.all([
    query<CountRow>(
      `
        SELECT COUNT(*) AS total
        FROM members
        ${where}
      `,
      filters,
    ),

    query<MemberListRow>(
      `
        SELECT
          member_id,
          full_name,
          member_category,
          nim_nip,
          status,
          consent_given,
          show_in_directory,
          entry_year
        FROM members
        ${where}
        ORDER BY full_name ASC, member_id ASC
        OFFSET @offset ROWS
        FETCH NEXT @per_page ROWS ONLY
      `,
      {
        ...filters,
        offset: (input.page - 1) * input.per_page,
        per_page: input.per_page,
      },
    ),
  ]);

  return {
    data: dataRows,
    total: Number(countRows[0]?.total ?? 0),
  };
}