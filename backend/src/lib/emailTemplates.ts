// Templat email notifikasi (FSD-2.21). Isi singkat, tanpa data sensitif.
const fmt = (d: Date | string) =>
  new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(d));

/** Escape karakter HTML pada data dari pengguna */
const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const wrap = (title: string, body: string) => `
<div style="font-family:Arial,sans-serif;max-width:560px;color:#1c1917">
  <h2 style="color:#544236;margin:0 0 12px">${title}</h2>
  ${body}
  <p style="margin-top:24px;font-size:12px;color:#78716c">Email otomatis dari Sistem Gereja Kampus KMK UNS. Mohon tidak membalas email ini.</p>
</div>`;

interface LoanMail {
  loan_code: string;
  borrower_name: string;
  place: string;
  start_at: Date | string;
  end_at: Date | string;
}

export const loanSubmitted = (l: LoanMail, statusUrl: string) => ({
  subject: `Pengajuan peminjaman ${l.loan_code} diterima`,
  html: wrap('Pengajuan peminjaman diterima', `
    <p>Halo ${esc(l.borrower_name)},</p>
    <p>Pengajuan Anda sudah kami terima dan menunggu persetujuan Sarpras.</p>
    <p><b>Kode lacak:</b> <span style="font-family:monospace;font-size:18px">${l.loan_code}</span><br/>
       <b>Yang dipinjam:</b> ${esc(l.place)}<br/>
       <b>Waktu:</b> ${fmt(l.start_at)} – ${fmt(l.end_at)}</p>
    <p>Pantau status di <a href="${statusUrl}">${statusUrl}</a> dengan kode lacak dan nomor telepon Anda.</p>`),
});

export const loanDecision = (l: LoanMail, approved: boolean, reason: string | null, statusUrl: string) => ({
  subject: `Pengajuan ${l.loan_code} ${approved ? 'disetujui' : 'ditolak'}`,
  html: wrap(approved ? 'Pengajuan disetujui' : 'Pengajuan ditolak', `
    <p>Halo ${esc(l.borrower_name)},</p>
    <p>Pengajuan peminjaman <b>${l.loan_code}</b> (${esc(l.place)}, ${fmt(l.start_at)}) <b>${approved ? 'DISETUJUI' : 'DITOLAK'}</b>.</p>
    ${reason ? `<p><b>Alasan:</b> ${esc(reason)}</p>` : ''}
    ${approved ? '<p>Silakan ambil kunci/barang di sekretariat sesuai jadwal.</p>' : ''}
    <p>Detail: <a href="${statusUrl}">${statusUrl}</a></p>`),
});

/** Email notifikasi untuk pengurus (FSD-2.21): salinan notifikasi aplikasi */
export const officerNotice = (title: string, message: string, appUrl?: string) => ({
  subject: title,
  html: wrap(esc(title), `
    <p>${esc(message)}</p>
    ${appUrl ? `<p><a href="${esc(appUrl)}" style="color:#544236">Buka aplikasi</a></p>` : ''}`),
});
