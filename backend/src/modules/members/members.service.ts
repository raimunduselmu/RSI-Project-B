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

      // FSD-2.23 Main Flow Step 4:
      // Audit event MEMBER_CREATED.
      // Tidak mencatat password atau token.
      await query(
        `
          INSERT INTO audit_logs (
            user_id,
            user_email,
            action_type,
            resource_type,
            resource_id,
            old_values,
            new_values,
            ip_address,
            created_at
          )
          VALUES (
            @user_id,
            @user_email,
            N'MEMBER_CREATED',
            N'members',
            @resource_id,
            NULL,
            @new_values,
            @ip_address,
            SYSUTCDATETIME()
          )
        `,
        {
          user_id: user.id,
          user_email: user.username,
          resource_id: member.member_id,
          new_values: JSON.stringify(member),
          ip_address: ip ?? null,
        },
        tx,
      );

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