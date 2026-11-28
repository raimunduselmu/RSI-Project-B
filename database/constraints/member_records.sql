-- TSD Table 64/65
-- FSD-2.24
-- BR-59 dan BR-60

-- ==================================================
-- 1. Jenis riwayat hanya PELAYANAN dan KATEKESE
-- ==================================================

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = N'CK_member_records_record_type'
)
BEGIN
  ALTER TABLE dbo.member_records
    ADD CONSTRAINT CK_member_records_record_type
    CHECK (
      record_type IN (
        N'PELAYANAN',
        N'KATEKESE'
      )
    );
END;
GO

-- ==================================================
-- 2. Tanggal riwayat tidak boleh di masa depan
-- BR-60
-- ==================================================

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints
  WHERE name = N'CK_member_records_record_date'
)
BEGIN
  ALTER TABLE dbo.member_records
    ADD CONSTRAINT CK_member_records_record_date
    CHECK (
      record_date <= CAST(SYSUTCDATETIME() AS DATE)
    );
END;
GO

-- ==================================================
-- 3. Relasi koreksi ke riwayat sebelumnya
-- BR-59
-- ==================================================

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = N'FK_member_records_corrects_record'
)
BEGIN
  ALTER TABLE dbo.member_records
    ADD CONSTRAINT FK_member_records_corrects_record
    FOREIGN KEY (corrects_record_id)
    REFERENCES dbo.member_records(record_id);
END;
GO