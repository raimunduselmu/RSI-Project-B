# Sistem Informasi Gereja Kampus KMK UNS

aplikasi web KMK UNS sesuai **FSD v1.2** dan **TSD v1.1** (lihat folder `docs/`).

| Bagian | Stack |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind 3 + React Router 6 (TypeScript) |
| Backend | Node.js 24 + TypeScript + Express |
| ORM | Drizzle ORM (dialek MSSQL, versi `rc`, dikunci lewat `package-lock.json`) |
| Database | SQL Server 2022 (Opsi A) / Azure SQL (Opsi B) |
| Penjadwal | node-cron (Opsi A) / cron-job.org → endpoint internal (Opsi B) |

## Struktur folder

```
PROJECT/
├── backend/      API Express (modul per fungsi FSD)
├── frontend/     React SPA (halaman per SCR FSD)
├── database/     Stored procedure, function, view, trigger (file .sql)
├── deploy/       Dockerfile, nginx, skrip backup
├── docs/         BRD, SRS, FSD, TSD, test script, manual, OpenAPI
└── docker-compose.yml
```

## Prasyarat

- Node.js 24 LTS dan npm 10+
- Docker Desktop (untuk SQL Server lokal) **atau** SQL Server 2022 terpasang
- Git

## Menjalankan untuk development

```bash
# 1. clone & salin env
git clone <url-repo> && cd PROJECT
cp .env.example .env                 # isi password, JWT_SECRET, SMTP

# 2. nyalakan SQL Server saja
docker compose up -d db

# 3. backend
cd backend
npm install
npm run db:create                    # membuat database kmk_uns bila belum ada
npm run db:migrate                   # tabel dari skema Drizzle
npm run db:objects                   # SP, function, view, trigger dari /database
npm run db:seed                      # role, admin pertama, workflow, pengaturan
npm run dev                          # http://localhost:4000/api/v1/health

# 4. frontend (terminal lain)
cd frontend
npm install
npm run dev                          # http://localhost:5173
```

Login awal: username `admin`, password dari `SEED_ADMIN_PASSWORD` di `.env`
(akun wajib ganti password saat login pertama).

## Menjalankan seluruh stack (Opsi A, VM Linux)

```bash
cp .env.example .env   # isi nilai produksi
docker compose up -d --build
docker compose exec backend npm run db:setup   # migrate + objects + seed
```

Aplikasi tersedia di `http://<ip-vm>/`. Lihat TSD Bagian 1.2 untuk detail.

## Aturan kerja tim

Baca **CONTRIBUTING.md** sebelum membuat branch pertama.

| Peran | Folder utama |
|---|---|
| Back end | `backend/src/modules`, `backend/src/middleware`, `backend/src/lib`, `backend/src/jobs` |
| Full stack | `database/`, `backend/src/db`, `deploy/`, `docker-compose.yml`, `frontend/src/lib`, `frontend/src/context` |
| Front end | `frontend/src/pages`, `frontend/src/layouts`, `frontend/src/routes`, `frontend/src/hooks` |
| UI/UX | `frontend/src/components`, `frontend/tailwind.config.js`, `docs/screenshots`, manual pengguna |
