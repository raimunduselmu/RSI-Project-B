-- CHECK & UNIQUE constraint tabel peminjaman (TSD Bagian 4). Aman dijalankan ulang.
IF OBJECT_ID(N'dbo.CK_loan_requests_type', N'C') IS NULL
  ALTER TABLE dbo.loan_requests ADD CONSTRAINT CK_loan_requests_type
    CHECK (request_type IN (N'RUANGAN', N'ASET'));
IF OBJECT_ID(N'dbo.CK_loan_requests_status', N'C') IS NULL
  ALTER TABLE dbo.loan_requests ADD CONSTRAINT CK_loan_requests_status
    CHECK (status IN (N'MENUNGGU', N'DISETUJUI', N'DITOLAK', N'DIAMBIL', N'SELESAI', N'DIBATALKAN'));
IF OBJECT_ID(N'dbo.CK_loan_requests_time', N'C') IS NULL
  ALTER TABLE dbo.loan_requests ADD CONSTRAINT CK_loan_requests_time CHECK (end_at > start_at);
IF OBJECT_ID(N'dbo.CK_loan_items_condition', N'C') IS NULL
  ALTER TABLE dbo.loan_items ADD CONSTRAINT CK_loan_items_condition
    CHECK ((condition_out IS NULL OR condition_out IN (N'BAIK', N'RUSAK_RINGAN', N'RUSAK_BERAT'))
       AND (condition_in  IS NULL OR condition_in  IN (N'BAIK', N'RUSAK_RINGAN', N'RUSAK_BERAT')));
IF OBJECT_ID(N'dbo.UQ_loan_items_loan_asset', N'UQ') IS NULL
  ALTER TABLE dbo.loan_items ADD CONSTRAINT UQ_loan_items_loan_asset UNIQUE (loan_id, asset_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_loan_requests_status_start')
  CREATE INDEX IX_loan_requests_status_start ON dbo.loan_requests (status, start_at) INCLUDE (end_at, room_id);
