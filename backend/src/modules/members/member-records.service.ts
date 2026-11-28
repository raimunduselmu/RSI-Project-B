// FSD-2.24 — Service riwayat pelayanan, sakramen, dan katekese umat.
// TSD Table 28/29: member_records dan sacraments.
//
// BR-59: tidak menyediakan UPDATE/DELETE.
// Koreksi ditambahkan sebagai record baru.
//
// BR-60: tanggal kejadian tidak boleh melewati tanggal UTC hari ini
// sesuai ketentuan TSD.

import { randomUUID } from 'node:crypto';
import type sql from 'mssql';

import { AppError } from '../../lib/AppError.js';
import {
  query,
  withTransaction,
} from '../../lib/sql.js';

import type { AuthUser } from '../../types/express.js';

import type {
  CreateMemberRecordInput,
  ListMemberRecordsQuery,
} from './member-records.schema.js';

interface RecordRow {
  record_id: string;
  member_id: string;

  record_type:
    | 'PELAYANAN'
    | 'KATEKESE'
    | 'SAKRAMEN';

  title: string;

  record_date: string | Date;

  period_id: number | null;

  place: string | null;

  note: string | null;

  corrects_record_id: string | null;

  created_at: string | Date;

  source_table:
    | 'member_records'
    | 'sacraments';
}

// Menyamakan format tanggal hasil query menjadi YYYY-MM-DD.
const asYmd = (value: string | Date) =>
  value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10);

// BR-60: tanggal tidak boleh melewati tanggal UTC hari ini.
function assertNotFutureDate(date: string) {
  const todayUtc = new Date().toISOString().slice(0, 10);

  if (date > todayUtc) {
    throw new AppError(
      'ERR-VAL-04',
      'Tanggal riwayat tidak boleh di masa depan',
      {
        record_date: [
          'Tanggal riwayat tidak boleh di masa depan',
        ],
      },
    );
  }
}

// Memastikan umat tersedia dan tidak dalam kondisi soft-delete.
async function assertMemberExists(
  memberId: string,
  tx?: sql.Transaction,
) {
  const rows = await query<{ member_id: string }>(
    `
      SELECT member_id
      FROM members
      WHERE member_id = @member_id
        AND is_deleted = 0
    `,
    { member_id: memberId },
    tx,
  );

  if (!rows[0]) {
    throw new AppError(
      'ERR-DATA-01',
      'Data umat tidak ditemukan',
    );
  }
}

/**
 * FSD-2.24 Main Flow Step 2 + AF-2.
 *
 * Menggabungkan data dari:
 * - member_records
 * - sacraments
 *
 * Filter period_id hanya berlaku pada pelayanan dan katekese
 * karena TSD Table 29 tidak menyediakan period_id pada sacraments.
 */
export async function listMemberRecords(
  memberId: string,
  filters: ListMemberRecordsQuery,
) {
  await assertMemberExists(memberId);

  const rows = await query<RecordRow>(
    `
      WITH all_records AS (

        -- Riwayat pelayanan dan katekese.
        SELECT
          CAST(mr.record_id AS NVARCHAR(36)) AS record_id,
          CAST(mr.member_id AS NVARCHAR(36)) AS member_id,
          mr.record_type,
          mr.title,

          CONVERT(
            CHAR(10),
            mr.record_date,
            23
          ) AS record_date,

          mr.period_id,

          CAST(NULL AS NVARCHAR(150)) AS place,

          mr.note,

          CAST(
            mr.corrects_record_id AS NVARCHAR(36)
          ) AS corrects_record_id,

          mr.created_at,

          N'member_records' AS source_table

        FROM member_records mr

        WHERE mr.member_id = @member_id

        UNION ALL

        -- Riwayat sakramen.
        SELECT
          CAST(s.sacrament_id AS NVARCHAR(36)) AS record_id,
          CAST(s.member_id AS NVARCHAR(36)) AS member_id,

          N'SAKRAMEN' AS record_type,

          s.sacrament_type AS title,

          CONVERT(
            CHAR(10),
            s.sacrament_date,
            23
          ) AS record_date,

          CAST(NULL AS INT) AS period_id,

          s.place,

          s.note,

          CAST(NULL AS NVARCHAR(36)) AS corrects_record_id,

          s.created_at,

          N'sacraments' AS source_table

        FROM sacraments s

        WHERE s.member_id = @member_id
      )

      SELECT
        record_id,
        member_id,
        record_type,
        title,
        record_date,
        period_id,
        place,
        note,
        corrects_record_id,
        created_at,
        source_table

      FROM all_records

      WHERE
        (
          @record_type IS NULL
          OR record_type = @record_type
        )

        AND
        (
          @period_id IS NULL
          OR period_id = @period_id
        )

      ORDER BY
        record_date DESC,
        created_at DESC,
        record_id DESC
    `,
    {
      member_id: memberId,
      record_type: filters.record_type ?? null,
      period_id: filters.period_id ?? null,
    },
  );

  return rows.map((row) => ({
    ...row,
    record_date: asYmd(row.record_date),
  }));
}

/**
 * FSD-2.24 Main Flow Step 3-5.
 *
 * Menambahkan riwayat baru.
 * Audit trail dihasilkan oleh database trigger.
 *
 * Semua operasi insert berada dalam satu transaksi.
 */
export async function createMemberRecord(
  memberId: string,
  input: CreateMemberRecordInput,
  user: AuthUser,
  ip?: string,
) {
  assertNotFutureDate(input.record_date);

  const recordId = randomUUID();

  return withTransaction(
    user,
    ip,
    async (tx) => {
      await assertMemberExists(memberId, tx);

      // ==================================================
      // JENIS 1: SAKRAMEN
      // TSD Table 29: tabel sacraments
      // ==================================================

      if (input.record_type === 'SAKRAMEN') {
        await query(
          `
            INSERT INTO sacraments (
              sacrament_id,
              member_id,
              sacrament_type,
              sacrament_date,
              place,
              note
            )
            VALUES (
              @record_id,
              @member_id,
              @sacrament_type,
              @record_date,
              @place,
              @note
            )
          `,
          {
            record_id: recordId,
            member_id: memberId,
            sacrament_type: input.title,
            record_date: input.record_date,
            place: input.place ?? null,
            note: input.note ?? null,
          },
          tx,
        );

        return {
          record_id: recordId,
          member_id: memberId,
          record_type: 'SAKRAMEN' as const,
          title: input.title,
          record_date: input.record_date,
          period_id: null,
          place: input.place ?? null,
          note: input.note ?? null,
          corrects_record_id: null,
          source_table: 'sacraments' as const,
        };
      }

      // ==================================================
      // JENIS 2: PELAYANAN / KATEKESE
      // TSD Table 28: tabel member_records
      // ==================================================

      // Pastikan periode benar-benar tersedia.
      const period = await query<{ period_id: number }>(
        `
          SELECT period_id
          FROM periods
          WHERE period_id = @period_id
        `,
        {
          period_id: input.period_id,
        },
        tx,
      );

      if (!period[0]) {
        throw new AppError(
          'ERR-DATA-01',
          'Periode tidak ditemukan',
        );
      }

      // ==================================================
      // FSD-2.24 AF-1: KOREKSI RIWAYAT
      // Record lama tidak diubah atau dihapus.
      // ==================================================

      if (input.corrects_record_id) {
        const original = await query<{
          record_id: string;
        }>(
          `
            SELECT record_id
            FROM member_records
            WHERE record_id = @record_id
              AND member_id = @member_id
              AND record_type = @record_type
          `,
          {
            record_id: input.corrects_record_id,
            member_id: memberId,
            record_type: input.record_type,
          },
          tx,
        );

        if (!original[0]) {
          throw new AppError(
            'ERR-DATA-01',
            'Riwayat yang akan dikoreksi tidak ditemukan pada umat dan jenis riwayat tersebut',
          );
        }
      }

      await query(
        `
          INSERT INTO member_records (
            record_id,
            member_id,
            record_type,
            title,
            record_date,
            period_id,
            note,
            corrects_record_id
          )
          VALUES (
            @record_id,
            @member_id,
            @record_type,
            @title,
            @record_date,
            @period_id,
            @note,
            @corrects_record_id
          )
        `,
        {
          record_id: recordId,
          member_id: memberId,
          record_type: input.record_type,
          title: input.title,
          record_date: input.record_date,
          period_id: input.period_id,
          note: input.note ?? null,
          corrects_record_id:
            input.corrects_record_id ?? null,
        },
        tx,
      );

      return {
        record_id: recordId,
        member_id: memberId,
        record_type: input.record_type,
        title: input.title,
        record_date: input.record_date,
        period_id: input.period_id,
        place: null,
        note: input.note ?? null,
        corrects_record_id:
          input.corrects_record_id ?? null,
        source_table: 'member_records' as const,
      };
    },
  );
}