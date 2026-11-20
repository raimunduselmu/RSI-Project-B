-- CHECK constraint tabel aset (TSD Bagian 4). Aman dijalankan ulang.
IF OBJECT_ID(N'dbo.CK_assets_condition', N'C') IS NULL
  ALTER TABLE dbo.assets ADD CONSTRAINT CK_assets_condition
    CHECK (asset_condition IN (N'BAIK', N'RUSAK_RINGAN', N'RUSAK_BERAT'));
IF OBJECT_ID(N'dbo.CK_assets_status', N'C') IS NULL
  ALTER TABLE dbo.assets ADD CONSTRAINT CK_assets_status
    CHECK (status IN (N'TERSEDIA', N'DIPINJAM', N'DIGUNAKAN', N'PEMELIHARAAN', N'HILANG', N'NONAKTIF'));
IF OBJECT_ID(N'dbo.CK_assets_source', N'C') IS NULL
  ALTER TABLE dbo.assets ADD CONSTRAINT CK_assets_source
    CHECK (source_type IN (N'KAS', N'DONASI', N'HIBAH'));
IF OBJECT_ID(N'dbo.CK_asset_histories_event', N'C') IS NULL
  ALTER TABLE dbo.asset_histories ADD CONSTRAINT CK_asset_histories_event
    CHECK (event_type IN (N'REGISTRASI', N'PINDAH_LOKASI', N'UBAH_KONDISI', N'UBAH_STATUS', N'PEMINJAMAN',
                          N'PENGEMBALIAN', N'PEMELIHARAAN', N'INSIDEN', N'PEMERIKSAAN'));
IF OBJECT_ID(N'dbo.CK_asset_histories_json', N'C') IS NULL
  ALTER TABLE dbo.asset_histories ADD CONSTRAINT CK_asset_histories_json
    CHECK ((old_value IS NULL OR ISJSON(old_value) = 1) AND (new_value IS NULL OR ISJSON(new_value) = 1));
