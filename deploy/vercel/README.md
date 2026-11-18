# Opsi B — Vercel + Azure SQL (alternatif/cadangan)

Kode aplikasi sama dengan Opsi A. Perbedaannya hanya di konfigurasi:

1. **Frontend** — import folder `frontend/` sebagai project Vercel (framework: Vite).
   Tambahkan rewrite `/api/*` ke URL project backend (lihat `frontend/vercel.json`).
2. **Backend** — import folder `backend/` sebagai project Vercel kedua.
   Entry function ada di `backend/api/index.ts`; `backend/vercel.json` mengarahkan semua route ke sana.
3. **Database** — buat Azure SQL Database (free offer), isi `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_ENCRYPT=true`.
4. **File** — `STORAGE_DRIVER=blob` dan `BLOB_READ_WRITE_TOKEN` dari Vercel Blob.
5. **Penjadwal** — `CRON_ENABLED=false`. Buat job di cron-job.org setiap 1 menit:
   `POST https://<backend>.vercel.app/api/v1/internal/notifications/retry`
   dengan header `x-cron-secret: <INTERNAL_CRON_SECRET>`.

Catatan: paket Hobby Vercel hanya untuk penggunaan non-komersial.
