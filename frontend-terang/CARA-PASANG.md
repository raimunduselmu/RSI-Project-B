# Frontend KMK UNS — Tema Terang (tersambung ke backend)

Isi zip ini adalah frontend tema terang (krem hangat + aksen oranye) yang sudah memakai API backend.
Basis: branch `main` terbaru (backend gelombang 1–3). Patch sudah dicek bisa dipasang bersih di `main`.

## Cara pasang

### Opsi 1 — pakai git (disarankan)
```bash
git checkout main && git pull
git checkout -b feat/ui-terang
git apply ui-terang-api.patch
```

### Opsi 2 — salin manual
1. Ekstrak folder `frontend/` dari zip ini ke folder proyek (timpa file lama).
2. Hapus 3 file lama yang sudah digabung ke halaman lain:
   - `frontend/src/pages/loans/LoanApproval.tsx`
   - `frontend/src/pages/loans/LoanHandover.tsx`
   - `frontend/src/pages/finance/BudgetPage.tsx`

## Menjalankan
1. Salin `.env.example` di root repo menjadi `.env`, isi `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.
2. Backend:
   ```bash
   cd backend
   npm install
   npm run db:setup
   npm run dev        # http://localhost:3000/api/v1
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev        # buka http://localhost:5173
   ```
   Harus dibuka di port 5173, karena CORS backend hanya mengizinkan `APP_URL`.
   Proxy Vite sudah diarahkan ke port 3000.

Akun demo: `admin` / `Admin-12345`, `fransiskus.sarpras` dan `gregorius.pht` / `Demo-12345`.

## Wajib dicek setelah dipasang
```bash
cd frontend
npm run typecheck
npm run lint
npm run build
```
Kalau ada error, kirim pesannya.

## Catatan
- Halaman yang endpoint-nya belum disambungkan masih menampilkan **data contoh** dengan
  spanduk oranye "Data contoh". Daftarnya ada di `src/lib/backendStatus.ts`.
- Beberapa modul yang sudah selesai di backend gelombang 2–3 (Kelola Pengguna, Pengaturan,
  Periode & Pengurus, Iuran Kas, Kas & Anggaran, Laporan Keuangan, Notifikasi, Dashboard
  ringkasan) halamannya **belum** disambungkan, jadi masih memakai data contoh.
