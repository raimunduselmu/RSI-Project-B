# Objek Database (SQL Server)

Tabel dibuat oleh **Drizzle** (`backend/src/db/schema` → `npm run db:migrate`).
Folder ini berisi objek yang ditulis langsung dalam SQL, sesuai TSD Bagian 5:

| Folder | Isi |
|---|---|
| `procedures/` | Stored procedure (transaksi multi-tabel) |
| `functions/` | Scalar / table-valued function |
| `views/` | View untuk laporan & halaman |
| `triggers/` | Trigger audit, riwayat, append-only, arsip periode |

Jalankan semua objek: `cd backend && npm run db:objects`.
Urutan eksekusi: `functions` → `views` → `procedures` → `triggers` (alfabetis per folder).

Aturan penulisan:
- Selalu `CREATE OR ALTER` agar bisa dijalankan ulang.
- Satu objek per file, nama file = nama objek.
- Daftar ID dikirim sebagai JSON (`NVARCHAR(MAX)`) lalu dibaca dengan `OPENJSON`.
- Galat bisnis memakai `THROW 50xxx, N'ERR-xxx', 1;`.
- Pisahkan batch dengan baris `GO` (runner memecah file berdasarkan `GO`).
