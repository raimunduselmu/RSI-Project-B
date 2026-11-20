// FSD-2.46 — Cek Status publik. Data pribadi tidak ditampilkan; kode + telepon harus cocok (ERR-STS-01).
import { AppError } from '../../lib/AppError.js';
import { samePhone } from '../../lib/phone.js';
import { query } from '../../lib/sql.js';
import { sarprasWaLink } from '../loans/loans.service.js';

export async function checkStatus(code: string, phone: string) {
  if (code.startsWith('PJM-')) return loanStatus(code, phone);
  // TODO (BACKLOG): INT (intensi), PST (pendampingan), REG (pendaftaran kegiatan) setelah modulnya dibuat
  throw new AppError('ERR-STS-01');
}

async function loanStatus(code: string, phone: string) {
  const rows = await query<{
    loan_code: string; borrower_name: string; borrower_phone: string; request_type: string; room_name: string | null;
    asset_names: string | null; start_at: Date; end_at: Date; status: string; reject_reason: string | null; reviewed_at: Date | null;
  }>(
    `SELECT lr.loan_code, lr.borrower_name, lr.borrower_phone, lr.request_type, r.room_name,
            (SELECT STRING_AGG(a.asset_name, N', ') FROM loan_items li JOIN assets a ON a.asset_id = li.asset_id WHERE li.loan_id = lr.loan_id) AS asset_names,
            lr.start_at, lr.end_at, lr.status, lr.reject_reason, lr.reviewed_at
     FROM loan_requests lr LEFT JOIN rooms r ON r.room_id = lr.room_id
     WHERE lr.loan_code = @code`,
    { code },
  );
  const l = rows[0];
  // Pesan sama untuk "kode tidak ada" dan "telepon salah" agar tidak bisa ditebak
  if (!l || !samePhone(l.borrower_phone, phone)) throw new AppError('ERR-STS-01');
  return {
    type: 'PEMINJAMAN',
    code: l.loan_code,
    status: l.status,
    item: l.request_type === 'RUANGAN' ? l.room_name : l.asset_names,
    schedule: { start_at: l.start_at, end_at: l.end_at },
    decided_at: l.reviewed_at,
    reject_reason: l.reject_reason,
    pic_wa_link: await sarprasWaLink(l.loan_code, l.borrower_name),
  };
}
