-- CHECK, UNIQUE & index tabel inventaris lanjutan (TSD Bagian 4 tabel 10–17, gelombang 4). Aman dijalankan ulang.
IF OBJECT_ID(N'dbo.CK_usage_reports_status', N'C') IS NULL
  ALTER TABLE dbo.usage_reports ADD CONSTRAINT CK_usage_reports_status CHECK (status IN (N'BERLANGSUNG', N'SELESAI'));
IF OBJECT_ID(N'dbo.CK_usage_reports_time', N'C') IS NULL
  ALTER TABLE dbo.usage_reports ADD CONSTRAINT CK_usage_reports_time CHECK (planned_end_at > start_at);
IF OBJECT_ID(N'dbo.CK_usage_items_condition', N'C') IS NULL
  ALTER TABLE dbo.usage_report_items ADD CONSTRAINT CK_usage_items_condition
    CHECK (condition_after IS NULL OR condition_after IN (N'BAIK', N'RUSAK_RINGAN', N'RUSAK_BERAT'));
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_usage_items_report_asset')
  CREATE UNIQUE INDEX UQ_usage_items_report_asset ON dbo.usage_report_items (report_id, asset_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_usage_reports_status_time')
  CREATE INDEX IX_usage_reports_status_time ON dbo.usage_reports (status, start_at, planned_end_at) INCLUDE (room_id);

IF OBJECT_ID(N'dbo.CK_maint_sched_interval', N'C') IS NULL
  ALTER TABLE dbo.maintenance_schedules ADD CONSTRAINT CK_maint_sched_interval CHECK (interval_days > 0 AND reminder_days_before >= 0);
IF OBJECT_ID(N'dbo.CK_maint_logs_condition', N'C') IS NULL
  ALTER TABLE dbo.maintenance_logs ADD CONSTRAINT CK_maint_logs_condition
    CHECK (result_condition IN (N'BAIK', N'RUSAK_RINGAN', N'RUSAK_BERAT'));
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_maint_sched_due')
  CREATE INDEX IX_maint_sched_due ON dbo.maintenance_schedules (is_active, next_due_date) INCLUDE (asset_id);

IF OBJECT_ID(N'dbo.CK_incidents_type', N'C') IS NULL
  ALTER TABLE dbo.incidents ADD CONSTRAINT CK_incidents_type CHECK (incident_type IN (N'HILANG', N'RUSAK'));
IF OBJECT_ID(N'dbo.CK_incidents_status', N'C') IS NULL
  ALTER TABLE dbo.incidents ADD CONSTRAINT CK_incidents_status CHECK (status IN (N'DILAPORKAN', N'DIPROSES', N'SELESAI'));

IF OBJECT_ID(N'dbo.CK_asset_docs_type', N'C') IS NULL
  ALTER TABLE dbo.asset_documents ADD CONSTRAINT CK_asset_docs_type
    CHECK (doc_type IN (N'NOTA', N'GARANSI', N'BERITA_ACARA', N'FOTO', N'LAINNYA'));
IF OBJECT_ID(N'dbo.CK_asset_docs_size', N'C') IS NULL
  ALTER TABLE dbo.asset_documents ADD CONSTRAINT CK_asset_docs_size CHECK (file_size_kb BETWEEN 0 AND 5120);

IF OBJECT_ID(N'dbo.CK_stocktake_status', N'C') IS NULL
  ALTER TABLE dbo.stocktake_periods ADD CONSTRAINT CK_stocktake_status CHECK (status IN (N'TERBUKA', N'DITUTUP'));
-- BR-40: hanya satu periode TERBUKA
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_stocktake_one_open')
  CREATE UNIQUE INDEX UQ_stocktake_one_open ON dbo.stocktake_periods (status) WHERE status = N'TERBUKA';
IF OBJECT_ID(N'dbo.CK_stocktake_items_condition', N'C') IS NULL
  ALTER TABLE dbo.stocktake_items ADD CONSTRAINT CK_stocktake_items_condition
    CHECK (actual_condition IS NULL OR actual_condition IN (N'BAIK', N'RUSAK_RINGAN', N'RUSAK_BERAT'));
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_stocktake_items_period_asset')
  CREATE UNIQUE INDEX UQ_stocktake_items_period_asset ON dbo.stocktake_items (period_id, asset_id);
