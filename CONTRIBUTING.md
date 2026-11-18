# Panduan Kontribusi

## Branch

- `main` → selalu bisa dijalankan; hanya diubah lewat Pull Request.
- Satu branch per modul/fitur:
  - `feat/<modul>`  contoh `feat/loans`, `feat/kas`
  - `fix/<hal>`     contoh `fix/login-cookie`
  - `docs/<hal>`    contoh `docs/test-script`

```bash
git checkout main && git pull
git checkout -b feat/loans
# ... kerjakan ...
git add . && git commit -m "feat(loans): endpoint pickup aset"
git push -u origin feat/loans      # lalu buka Pull Request
```

## Pesan commit

Format: `tipe(modul): ringkasan` — tipe: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`.

## Konvensi kode

### Backend
- Satu modul = satu folder di `backend/src/modules/<modul>/` berisi:
  `<modul>.routes.ts` → `<modul>.controller.ts` → `<modul>.service.ts` + `<modul>.schema.ts` (Zod).
- Controller hanya mengurus request/response. Logika bisnis & query ada di service.
- Semua response memakai `lib/response.ts`; semua galat dilempar sebagai `AppError` dengan kode `ERR-xxx` dari FSD.
- Query multi-tabel yang harus atomik → stored procedure di `database/procedures` dan dipanggil lewat `lib/sql.ts`.
- Komentar referensi ke dokumen: `// FSD-2.11, BR-25`.

### Frontend
- Satu halaman = satu file di `frontend/src/pages/<modul>/`, nama mengikuti layar FSD
  (contoh `SCR-10` → `LoanApproval.tsx`). Cantumkan kode SCR di komentar teratas.
- Komponen yang dipakai ulang masuk `components/ui` (dasar) atau `components/shared`.
- Panggilan API hanya lewat `lib/api.ts`.
- Warna memakai token Tailwind `brand-*` dan `stone-*`, bukan kode hex langsung.

## Sebelum membuka Pull Request

- [ ] `npm run lint` dan `npm run typecheck` lolos (backend & frontend)
- [ ] Endpoint baru sudah ditambahkan ke `docs/api/openapi.yaml`
- [ ] Tidak ada file `.env`, `uploads/`, atau `node_modules/` yang ikut ter-commit
