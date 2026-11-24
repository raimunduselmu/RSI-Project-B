# Backlog Backend

Fitur yang **sengaja ditunda**. Centang bila sudah dikerjakan.
Gelombang 1: Aset + Peminjaman · Gelombang 2: Kepengurusan + Parameter Sistem + Iuran Kas · Gelombang 3: Kelola Pengguna + Notifikasi + Keuangan + Dashboard · Gelombang 4: Inventaris lanjutan.

## Modul Aset & Peminjaman (lanjutan)
- [x] Dokumen aset — unggah/unduh/hapus (FSD-2.16): tabel `asset_documents`, endpoint `/assets/{id}/documents`
- [x] Cetak label kode unik PDF (FSD-2.6): `POST /assets/labels` (pdfkit)
- [ ] Pembayaran/refund peminjaman (FSD-2.34): tabel `loan_payments`, `/loans/{id}/payments`
- [x] Lapor pemakaian internal (FSD-2.13): tabel `usage_reports`, `usage_report_items`, `sp_report_usage`
- [x] Pemeliharaan (FSD-2.14), Kehilangan & kerusakan (FSD-2.15), Pemeriksaan fisik (FSD-2.17)
- [x] Laporan inventaris + ekspor PDF/XLSX (FSD-2.19)
- [ ] Peminjaman untuk kegiatan `POST /events/{id}/loan-requests` (FSD-2.29) — kolom `event_id` sudah ada, FK ke `events` menyusul
- [x] `fn_check_availability` & `v_calendar_events`: sumber `usage_reports` BERLANGSUNG sudah ditambahkan
- [ ] `fn_check_availability` & `v_calendar_events`: tambahkan `liturgy_schedules` (TERBIT) dan `events` saat modulnya dibuat (BR-20)
- [ ] FK `assets.donation_id` → `donations` saat modul Donasi dibuat

## Cek Status publik (FSD-2.46)
- [ ] Kode INT (intensi), PST (pendampingan), REG (pendaftaran kegiatan) — saat ini hanya PJM
- [ ] `POST /public/status/cancel` (batalkan pendaftaran kegiatan)

## Gelombang 4 — sisa kecil
- [ ] Label: belum ada QR/barcode (FSD hanya mewajibkan kode, nama, kategori). Bisa ditambah dengan paket `bwip-js`
- [ ] `v_donor_transparency` & halaman transparansi (FSD-2.18): menunggu tabel `donations` (modul Donasi, Andra)
- [ ] Pemakaian internal yang melewati perkiraan selesai belum diingatkan otomatis (sekarang hanya ditandai `is_overdue`)

## Gelombang 3 (selesai) dan sisanya
- [x] Kelola Pengguna (FSD-2.3/2.4), Notifikasi aplikasi + email pengurus (FSD-2.21), Kas Masuk/Keluar + Anggaran + alur over-budget (FSD-2.32/2.33), Laporan Keuangan (FSD-2.34), Dashboard (FSD-2.40)
- [ ] Ekspor laporan dashboard (FSD-2.41): `GET /dashboard/export` masih 501
- [ ] Serah terima jabatan (FSD-2.26): masih 501
- [ ] `approval_logs` untuk over-budget: persetujuan PHT sekarang hanya mengubah status transaksi (belum dicatat di `approval_logs` karena perlu `workflow_steps` OVER_BUDGET)
- [ ] Login memakai email (opsional): saat ini hanya `username`
- [ ] Notifikasi email untuk event lain (liturgi terbit, kegiatan) saat modulnya dibuat: cukup panggil `notifyUsers`/`notifyRoles` dari `lib/notify.ts`

## Email
- [ ] Isi `SMTP_USER` + `SMTP_PASS` (Gmail App Password). Selama kosong, email hanya tampil di terminal backend (mode dev).

## Objek SQL tertunda
- [x] `trg_block_archived_period` & `v_kas_status` (dipasang di gelombang 2; folder `_pending/` dihapus)
- [ ] `trg_block_archived_period` untuk `handovers` saat tabelnya dibuat

## Kepengurusan (lanjutan gelombang 2)
- [ ] Serah terima jabatan (FSD-2.26): tabel `handovers`, `/handovers` (saat ini 501)
- [ ] Transisi periode: periode baru hanya bisa dibuat setelah periode lama diarsipkan. Untuk serah terima, pertimbangkan status `PERSIAPAN`
- [ ] Profil kepanitiaan proker (FSD-2.20): `committees`, `committee_members`
- [ ] Kelola Pengguna (FSD-2.4): buat akun pengurus + data pengurus sekaligus. Sementara akun dibuat lewat seed, lalu ditautkan di `PATCH /officers/{id}`
- [ ] Keumatan (FSD-2.23/2.24) — **Andra**: endpoint `/members`. Tabel `members` sudah dibuat di gelombang 2

## Keuangan (lanjutan)
- [ ] Kas masuk/keluar & anggaran (FSD-2.33): `/cash-transactions`, `/budgets`, persetujuan over-budget PHT. Tabel + `trg_budget_spent` sudah ada
- [ ] Donasi (FSD-2.32) — **Andra**: `donors`, `donations`, `sp_record_donation`
- [ ] Email notifikasi keputusan iuran (saat ini notifikasi aplikasi saja)

## Sinkronisasi dokumen
- [ ] TSD 4 `notification_logs`: tambah kolom `subject`, `body`, `created_at` (dipakai untuk kirim ulang email)
- [ ] TSD 4 `audit_logs`: `user_email` & `ip_address` dibuat boleh kosong (login gagal/proses sistem tidak selalu punya nilai)
- [ ] TSD 3.2: tambah `GET /assets/code-preview` dan `GET /assets/{id}/photo`
- [ ] FSD 6: tambah ERR-VAL-04, ERR-LOAN-04, ERR-WF-01 bila belum ada
- [ ] TSD 4 `divisions`/`positions`: tambah kolom `role_id` (role otomatis per divisi/jabatan, BR-115)
- [ ] TSD 4 `cash_transactions`: tambah `status`, `description`, `created_by`, `created_at`
- [ ] TSD 5.1: tambah `sp_sync_kas_dues` (pembentukan tagihan bulanan BR-120)
- [ ] TSD 5.4 `trg_revoke_roles_on_archive`: join `positions → divisions` (positions tidak punya `period_id`)
- [ ] TSD 3.2: tambah `GET /periods/active`, `POST /periods/{id}/copy-structure`, `PATCH /divisions/{id}`, `GET /officers/{id}`, `GET /kas/payments/{id}`, `GET /kas/recap`, `GET /public/settings/qris-image`
- [ ] FSD/TSD: kode file salah format memakai `ERR-FILE-01` (FSD menyebut ERR-VAL-05)
