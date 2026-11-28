// FSD-2.23: Daftar & pencarian data umat
// TSD Bagian 4: Table 27 - members
//
// Service bertanggung jawab atas query database.
// Controller tidak boleh berisi SQL atau logika pencarian.
//
// Data yang dikembalikan hanya berasal dari umat yang
// belum di-soft-delete. Data lengkap tetap dilindungi RBAC.


import { AppError } from '../../lib/AppError.js';
import {
  query,
  withTransaction,
  isUniqueViolation,
} from '../../lib/sql.js';
import type { AuthUser } from '../../types/express.js';
import type {
  CreateMemberInput,
  ListMembersQuery,
  UpdateMemberInput,
  UpdateMemberStatusInput,
} from './members.schema.js';


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
    entry_year: input.entry_year ?? null,
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
      AND (
        @entry_year IS NULL
        OR entry_year = @entry_year
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


 // FSD-2.23: Tambah data umat
 // BR-114: Persetujuan pengelolaan data
 // TSD Bagian 4: Table members
 // TSD Bagian 5: Audit log

interface CreatedMemberRow {
  member_id: string;
  full_name: string;
  member_category: string;
  nim_nip: string | null;
  phone: string | null;
  email: string | null;
  faculty: string | null;
  entry_year: number | null;
  status: string;
  consent_given: boolean;
  show_in_directory: boolean;
}

/**
 * FSD-2.23:
 * Membuat data umat baru setelah validasi request.
 *
 * EF-2:
 * NIM/NIP atau email yang sudah terdaftar menghasilkan ERR-DATA-02.
 *
 * FSD-2.23:
 * MEMBER_CREATED dicatat pada audit_logs dalam transaksi
 * yang sama dengan insert members.
 */
export async function createMember(
  input: CreateMemberInput,
  user: AuthUser,
  ip?: string,
) {
  try {
    return await withTransaction(user, ip, async (tx) => {
      // FSD-2.23 Main Flow Step 3:
      // Periksa keunikan NIM/NIP dan email sebelum insert.
      const duplicate = await query<{
        nim_nip: string | null;
        email: string | null;
      }>(
        `
          SELECT TOP (1)
            nim_nip,
            email
          FROM members
          WHERE
            (
              @nim_nip IS NOT NULL
              AND nim_nip = @nim_nip
            )
            OR
            (
              @email IS NOT NULL
              AND LOWER(email) = LOWER(@email)
            )
        `,
        {
          nim_nip: input.nim_nip ?? null,
          email: input.email ?? null,
        },
        tx,
      );

      if (duplicate.length > 0) {
        throw new AppError(
          'ERR-DATA-02',
          'NIM/NIP atau email sudah terdaftar',
        );
      }

      // FSD-2.23 Main Flow Step 4:
      // Database menghasilkan member_id melalui default NEWID().
      const inserted = await query<CreatedMemberRow>(
        `
          INSERT INTO members (
            full_name,
            member_category,
            nim_nip,
            phone,
            email,
            faculty,
            entry_year,
            status,
            consent_given,
            show_in_directory
          )
          OUTPUT
            inserted.member_id,
            inserted.full_name,
            inserted.member_category,
            inserted.nim_nip,
            inserted.phone,
            inserted.email,
            inserted.faculty,
            inserted.entry_year,
            inserted.status,
            inserted.consent_given,
            inserted.show_in_directory
          VALUES (
            @full_name,
            @member_category,
            @nim_nip,
            @phone,
            @email,
            @faculty,
            @entry_year,
            @status,
            @consent_given,
            @show_in_directory
          )
        `,
        {
          full_name: input.full_name,
          member_category: input.member_category,
          nim_nip: input.nim_nip ?? null,
          phone: input.phone ?? null,
          email: input.email ?? null,
          faculty: input.faculty ?? null,
          entry_year: input.entry_year ?? null,
          status: input.status,
          consent_given: input.consent_given,
          show_in_directory: input.show_in_directory,
        },
        tx,
      );

      const member = inserted[0];

      if (!member) {
        throw new Error('Insert member tidak menghasilkan data');
      }

      // TSD 5.4: trg_audit_changes_members mencatat MEMBER_CREATED
      // otomatis dalam transaksi yang sama melalui SESSION_CONTEXT.

      return member;
    });
  } catch (error) {
    // TSD: UNIQUE / PRIMARY KEY violation SQL Server.
    // Melindungi NIM/NIP dari duplikasi akibat request bersamaan.
    if (isUniqueViolation(error)) {
      throw new AppError(
        'ERR-DATA-02',
        'NIM/NIP atau email sudah terdaftar',
      );
    }

    throw error;
  }
}

// ==================================================
// FSD-2.23: Detail Data Umat
// TSD: GET /members/{id}
// TSD Bagian 4: Table 27 - members
// ==================================================

interface MemberDetailRow {
  member_id: string;
  full_name: string;
  member_category: string;
  nim_nip: string | null;
  phone: string | null;
  email: string | null;
  faculty: string | null;
  entry_year: number | null;
  status: string;
  consent_given: boolean;
  show_in_directory: boolean;
}

/**
 * FSD-2.23:
 * Mengambil detail umat berdasarkan UUID.
 *
 * BR-57:
 * Data lengkap hanya dapat diakses oleh Admin, PHT, dan Pastor.
 * Pembatasan role dilakukan pada route.
 *
 * BR-58:
 * Data umat yang telah di-soft-delete tidak ditampilkan.
 *
 * EF-4:
 * Data tidak ditemukan menghasilkan ERR-DATA-01.
 */
export async function getMemberById(
  memberId: string,
): Promise<MemberDetailRow> {
  const rows = await query<MemberDetailRow>(
    `
      SELECT
        member_id,
        full_name,
        member_category,
        nim_nip,
        phone,
        email,
        faculty,
        entry_year,
        status,
        consent_given,
        show_in_directory
      FROM members
      WHERE member_id = @member_id
        AND is_deleted = 0
    `,
    {
      member_id: memberId,
    },
  );

  const member = rows[0];

  if (!member) {
    throw new AppError(
      'ERR-DATA-01',
      'Data umat tidak ditemukan',
    );
  }

  return member;
}

// ==================================================
// FSD-2.23: Update profil umat
// TSD: PATCH /api/v1/members/{id}
// BR-114: Penarikan consent otomatis menonaktifkan data dan menyembunyikan direktori.
// ==================================================

interface MemberWriteRow {
  member_id: string;
  full_name: string;
  member_category: string;
  nim_nip: string | null;
  phone: string | null;
  email: string | null;
  faculty: string | null;
  entry_year: number | null;
  status: string;
  consent_given: boolean;
  show_in_directory: boolean;
  is_deleted?: boolean;
}

interface MemberAuditRow {
  member_id: string;
  full_name: string;
  member_category: string;
  nim_nip: string | null;
  phone: string | null;
  email: string | null;
  faculty: string | null;
  entry_year: number | null;
  status: string;
  consent_given: boolean;
  show_in_directory: boolean;
}


/**
 * FSD-2.23: Memperbarui profil umat tanpa mengubah field yang tidak dikirim.
 * BR-114: consent_given=false memaksa show_in_directory=false dan status=NONAKTIF.
 * Audit perubahan dicatat dalam transaksi yang sama.
 */
export async function updateMember(
  memberId: string,
  input: UpdateMemberInput,
  user: AuthUser,
  ip?: string,
): Promise<MemberWriteRow> {
  try {
    return await withTransaction(user, ip, async (tx) => {
      const existingRows = await query<MemberAuditRow>(
        `
          SELECT member_id, full_name, member_category, nim_nip, phone,
                 email, faculty, entry_year, status, consent_given, show_in_directory
          FROM members WITH (UPDLOCK, ROWLOCK)
          WHERE member_id = @member_id AND is_deleted = 0
        `,
        { member_id: memberId },
        tx,
      );
      const existing = existingRows[0];
      if (!existing) throw new AppError('ERR-DATA-01', 'Data umat tidak ditemukan');

      const nextConsent = input.consent_given ?? existing.consent_given;
      if (!nextConsent && input.show_in_directory === true) {
        throw new AppError('ERR-VAL-01', 'Direktori hanya dapat ditampilkan dengan persetujuan pemilik data');
      }
      const nextDirectory = nextConsent
        ? (input.show_in_directory ?? existing.show_in_directory)
        : false;

      const nextStatus = input.consent_given === false ? 'NONAKTIF' : existing.status;

      const fields: Array<[keyof UpdateMemberInput, string]> = [
        ['full_name', 'full_name'],
        ['member_category', 'member_category'],
        ['nim_nip', 'nim_nip'],
        ['phone', 'phone'],
        ['email', 'email'],
        ['faculty', 'faculty'],
        ['entry_year', 'entry_year'],
      ];
      const assignments: string[] = [];
      const params: Record<string, unknown> = { member_id: memberId };
      for (const [inputKey, column] of fields) {
        if (input[inputKey] !== undefined) {
          assignments.push(`${column} = @${column}`);
          params[column] = input[inputKey];
        }
      }
      if (input.consent_given !== undefined) {
        assignments.push('consent_given = @consent_given');
        params.consent_given = input.consent_given;
      }
      if (input.show_in_directory !== undefined || input.consent_given === false) {
        assignments.push('show_in_directory = @show_in_directory');
        params.show_in_directory = nextDirectory;
      }
      if (input.consent_given === false) {
        assignments.push('status = @status');
        params.status = nextStatus;
      }

      if (assignments.length === 0) {
        throw new AppError('ERR-VAL-01', 'Tidak ada perubahan data yang dapat disimpan');
      }

      // NIM/NIP dan email harus tetap unik, termasuk terhadap record soft-delete,
      // karena unique index TSD berlaku pada seluruh baris yang memiliki NIM/NIP.
      if (input.nim_nip !== undefined || input.email !== undefined) {
        const duplicateRows = await query<{ member_id: string }>(
          `
            SELECT TOP (1) member_id
            FROM members
            WHERE member_id <> @member_id
              AND (
                (@nim_nip IS NOT NULL AND nim_nip = @nim_nip)
                OR (@email IS NOT NULL AND LOWER(email) = LOWER(@email))
              )
          `,
          {
            member_id: memberId,
            nim_nip: input.nim_nip === undefined ? null : input.nim_nip,
            email: input.email === undefined ? null : input.email,
          },
          tx,
        );
        if (duplicateRows.length > 0) {
          throw new AppError('ERR-DATA-02', 'NIM/NIP atau email sudah terdaftar');
        }
      }

      const updatedRows = await query<MemberWriteRow>(
        `
          UPDATE members
          SET ${assignments.join(', ')}
          OUTPUT inserted.member_id, inserted.full_name, inserted.member_category,
                 inserted.nim_nip, inserted.phone, inserted.email, inserted.faculty,
                 inserted.entry_year, inserted.status, inserted.consent_given,
                 inserted.show_in_directory, inserted.is_deleted
          WHERE member_id = @member_id AND is_deleted = 0
        `,
        params,
        tx,
      );
      const updated = updatedRows[0];
      if (!updated) throw new AppError('ERR-DATA-01', 'Data umat tidak ditemukan');

      // TSD 5.4: trigger mencatat MEMBER_UPDATED atau MEMBER_CONSENT_WITHDRAWN.
      return updated;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError('ERR-DATA-02', 'NIM/NIP atau email sudah terdaftar');
    }
    throw error;
  }
}

// ==================================================
// FSD-2.23 AF-1: Ubah status keaktifan umat
// TSD: PATCH /api/v1/members/{id}/status
// Perubahan status dan alasan tersimpan di audit trail (old_values/new_values).
// ==================================================
export async function updateMemberStatus(
  memberId: string,
  input: UpdateMemberStatusInput,
  user: AuthUser,
  ip?: string,
) {
  return withTransaction(user, ip, async (tx) => {
    const existingRows = await query<MemberAuditRow>(
      `
        SELECT member_id, full_name, member_category, nim_nip, phone,
               email, faculty, entry_year, status, consent_given, show_in_directory
        FROM members WITH (UPDLOCK, ROWLOCK)
        WHERE member_id = @member_id AND is_deleted = 0
      `,
      { member_id: memberId },
      tx,
    );
    const existing = existingRows[0];
    if (!existing) throw new AppError('ERR-DATA-01', 'Data umat tidak ditemukan');
    if (input.status === existing.status) {
      throw new AppError('ERR-VAL-01', 'Status umat sudah sesuai dengan nilai yang dipilih');
    }
    if (input.status === 'AKTIF' && !existing.consent_given) {
      throw new AppError('ERR-VAL-01', 'Umat harus memberikan persetujuan pengelolaan data sebelum diaktifkan');
    }

    // Trigger membaca alasan dari SESSION_CONTEXT agar audit trail menyimpan
    // alasan perubahan tanpa menambah kolom yang tidak ada pada TSD Table 27.
    await query(
      `EXEC sp_set_session_context N'member_change_reason', @reason`,
      { reason: input.reason },
      tx,
    );
    let updatedRows: MemberWriteRow[];
    try {
      updatedRows = await query<MemberWriteRow>(
        `
          UPDATE members
          SET status = @status
          OUTPUT inserted.member_id, inserted.full_name, inserted.member_category,
                 inserted.nim_nip, inserted.phone, inserted.email, inserted.faculty,
                 inserted.entry_year, inserted.status, inserted.consent_given,
                 inserted.show_in_directory, inserted.is_deleted
          WHERE member_id = @member_id AND is_deleted = 0
        `,
        { member_id: memberId, status: input.status },
        tx,
      );
    } finally {
      await query(`EXEC sp_set_session_context N'member_change_reason', NULL`, {}, tx);
    }
    const updated = updatedRows[0];
    if (!updated) throw new AppError('ERR-DATA-01', 'Data umat tidak ditemukan');

    // TSD 5.4: trg_audit_changes_members mencatat status lama/baru,
    // alasan dari SESSION_CONTEXT, pelaku, IP, dan waktu perubahan.
    return { ...updated, reason: input.reason };
  });
}

// ==================================================
// FSD-2.23 / TSD: DELETE Admin = soft-delete, bukan penghapusan permanen.
// BR-58: Riwayat dan jejak audit tetap dipertahankan.
// ==================================================
export async function softDeleteMember(
  memberId: string,
  user: AuthUser,
  ip?: string,
) {
  return withTransaction(user, ip, async (tx) => {
    const existingRows = await query<MemberAuditRow>(
      `
        SELECT member_id, full_name, member_category, nim_nip, phone,
               email, faculty, entry_year, status, consent_given, show_in_directory
        FROM members WITH (UPDLOCK, ROWLOCK)
        WHERE member_id = @member_id AND is_deleted = 0
      `,
      { member_id: memberId },
      tx,
    );
    const existing = existingRows[0];
    if (!existing) throw new AppError('ERR-DATA-01', 'Data umat tidak ditemukan');

    const updatedRows = await query<{ member_id: string; is_deleted: boolean }>(
      `
        UPDATE members
        SET is_deleted = 1, show_in_directory = 0, status = N'NONAKTIF'
        OUTPUT inserted.member_id, inserted.is_deleted
        WHERE member_id = @member_id AND is_deleted = 0
      `,
      { member_id: memberId },
      tx,
    );
    const updated = updatedRows[0];
    if (!updated) throw new AppError('ERR-DATA-01', 'Data umat tidak ditemukan');

    // TSD 5.4: trigger mencatat MEMBER_SOFT_DELETED dan snapshot sebelum/sesudah.
    return { member_id: memberId, is_deleted: true };
  });
}
