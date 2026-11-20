-- CHECK constraint workflow & notifikasi (TSD Bagian 4). Aman dijalankan ulang.
IF OBJECT_ID(N'dbo.CK_approval_logs_decision', N'C') IS NULL
  ALTER TABLE dbo.approval_logs ADD CONSTRAINT CK_approval_logs_decision CHECK (decision IN (N'SETUJU', N'TOLAK'));
IF OBJECT_ID(N'dbo.CK_notifications_channel', N'C') IS NULL
  ALTER TABLE dbo.notifications ADD CONSTRAINT CK_notifications_channel CHECK (channel IN (N'APLIKASI', N'EMAIL'));
IF OBJECT_ID(N'dbo.CK_notification_logs_status', N'C') IS NULL
  ALTER TABLE dbo.notification_logs ADD CONSTRAINT CK_notification_logs_status CHECK (status IN (N'PENDING', N'SENT', N'FAILED'));
