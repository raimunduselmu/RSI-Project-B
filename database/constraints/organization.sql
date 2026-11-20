-- CHECK, UNIQUE & index tabel Kepengurusan + Keumatan (TSD Bagian 4, FSD-2.23, 2.25). Aman dijalankan ulang.
IF OBJECT_ID(N'dbo.CK_periods_status', N'C') IS NULL
  ALTER TABLE dbo.periods ADD CONSTRAINT CK_periods_status CHECK (status IN (N'AKTIF', N'ARSIP'));
IF OBJECT_ID(N'dbo.CK_periods_dates', N'C') IS NULL
  ALTER TABLE dbo.periods ADD CONSTRAINT CK_periods_dates CHECK (end_date > start_date);
IF OBJECT_ID(N'dbo.CK_periods_name', N'C') IS NULL
  ALTER TABLE dbo.periods ADD CONSTRAINT CK_periods_name CHECK (period_name LIKE N'[1-2][0-9][0-9][0-9]/[1-2][0-9][0-9][0-9]');
-- BR-61: hanya satu periode AKTIF
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_periods_one_active')
  CREATE UNIQUE INDEX UX_periods_one_active ON dbo.periods (status) WHERE status = N'AKTIF';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_divisions_period_name')
  CREATE UNIQUE INDEX UX_divisions_period_name ON dbo.divisions (period_id, division_name);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_positions_division_name')
  CREATE UNIQUE INDEX UX_positions_division_name ON dbo.positions (division_id, position_name);

IF OBJECT_ID(N'dbo.CK_officers_dates', N'C') IS NULL
  ALTER TABLE dbo.officers ADD CONSTRAINT CK_officers_dates CHECK (end_date IS NULL OR end_date >= start_date);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_officers_user')
  CREATE INDEX IX_officers_user ON dbo.officers (user_id) INCLUDE (position_id, end_date);

IF OBJECT_ID(N'dbo.CK_members_category', N'C') IS NULL
  ALTER TABLE dbo.members ADD CONSTRAINT CK_members_category
    CHECK (member_category IN (N'MAHASISWA', N'DOSEN', N'STAF', N'ALUMNI'));
IF OBJECT_ID(N'dbo.CK_members_status', N'C') IS NULL
  ALTER TABLE dbo.members ADD CONSTRAINT CK_members_status CHECK (status IN (N'AKTIF', N'NONAKTIF', N'ALUMNI'));
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_members_nim_nip')
  CREATE UNIQUE INDEX UX_members_nim_nip ON dbo.members (nim_nip) WHERE nim_nip IS NOT NULL;
