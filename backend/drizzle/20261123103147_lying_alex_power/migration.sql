CREATE TABLE [asset_documents] (
	[document_id] uniqueidentifier CONSTRAINT [asset_documents_document_id_default] DEFAULT (NEWID()),
	[asset_id] uniqueidentifier NOT NULL,
	[doc_type] nvarchar(20) NOT NULL,
	[doc_title] nvarchar(150) NOT NULL,
	[file_path] nvarchar(255) NOT NULL,
	[file_size_kb] int NOT NULL,
	[mime_type] nvarchar(100) NOT NULL,
	[uploaded_by] uniqueidentifier,
	[uploaded_at] datetime2 NOT NULL CONSTRAINT [asset_documents_uploaded_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [asset_documents_pkey] PRIMARY KEY([document_id])
);
--> statement-breakpoint
CREATE TABLE [incidents] (
	[incident_id] uniqueidentifier CONSTRAINT [incidents_incident_id_default] DEFAULT (NEWID()),
	[asset_id] uniqueidentifier NOT NULL,
	[incident_type] nvarchar(20) NOT NULL,
	[occurred_date] date NOT NULL,
	[description] nvarchar(max) NOT NULL,
	[reported_by] uniqueidentifier,
	[responsible_name] nvarchar(150),
	[status] nvarchar(20) NOT NULL CONSTRAINT [incidents_status_default] DEFAULT ('DILAPORKAN'),
	[follow_up] nvarchar(max),
	[resolved_at] datetime2,
	[created_at] datetime2 NOT NULL CONSTRAINT [incidents_created_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [incidents_pkey] PRIMARY KEY([incident_id])
);
--> statement-breakpoint
CREATE TABLE [maintenance_logs] (
	[log_id] uniqueidentifier CONSTRAINT [maintenance_logs_log_id_default] DEFAULT (NEWID()),
	[schedule_id] uniqueidentifier NOT NULL,
	[asset_id] uniqueidentifier NOT NULL,
	[performed_date] date NOT NULL,
	[performed_by] nvarchar(100) NOT NULL,
	[result_condition] nvarchar(20) NOT NULL,
	[notes] nvarchar(max),
	[created_at] datetime2 NOT NULL CONSTRAINT [maintenance_logs_created_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [maintenance_logs_pkey] PRIMARY KEY([log_id])
);
--> statement-breakpoint
CREATE TABLE [maintenance_schedules] (
	[schedule_id] uniqueidentifier CONSTRAINT [maintenance_schedules_schedule_id_default] DEFAULT (NEWID()),
	[asset_id] uniqueidentifier NOT NULL,
	[task_name] nvarchar(150) NOT NULL,
	[interval_days] int NOT NULL,
	[next_due_date] date NOT NULL,
	[last_done_date] date,
	[reminder_days_before] int NOT NULL CONSTRAINT [maintenance_schedules_reminder_days_before_default] DEFAULT ((7)),
	[is_active] bit NOT NULL CONSTRAINT [maintenance_schedules_is_active_default] DEFAULT ((1)),
	[created_at] datetime2 NOT NULL CONSTRAINT [maintenance_schedules_created_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [maintenance_schedules_pkey] PRIMARY KEY([schedule_id])
);
--> statement-breakpoint
CREATE TABLE [stocktake_items] (
	[item_id] uniqueidentifier CONSTRAINT [stocktake_items_item_id_default] DEFAULT (NEWID()),
	[period_id] uniqueidentifier NOT NULL,
	[asset_id] uniqueidentifier NOT NULL,
	[found] bit,
	[actual_location] nvarchar(100),
	[actual_condition] nvarchar(20),
	[checked_by] uniqueidentifier,
	[checked_at] datetime2,
	[note] nvarchar(max),
	CONSTRAINT [stocktake_items_pkey] PRIMARY KEY([item_id])
);
--> statement-breakpoint
CREATE TABLE [stocktake_periods] (
	[period_id] uniqueidentifier CONSTRAINT [stocktake_periods_period_id_default] DEFAULT (NEWID()),
	[period_name] nvarchar(150) NOT NULL,
	[start_date] date NOT NULL,
	[end_date] date,
	[status] nvarchar(20) NOT NULL CONSTRAINT [stocktake_periods_status_default] DEFAULT ('TERBUKA'),
	[created_by] uniqueidentifier,
	[closed_at] datetime2,
	CONSTRAINT [stocktake_periods_pkey] PRIMARY KEY([period_id])
);
--> statement-breakpoint
CREATE TABLE [usage_report_items] (
	[report_item_id] uniqueidentifier CONSTRAINT [usage_report_items_report_item_id_default] DEFAULT (NEWID()),
	[report_id] uniqueidentifier NOT NULL,
	[asset_id] uniqueidentifier NOT NULL,
	[condition_after] nvarchar(20),
	CONSTRAINT [usage_report_items_pkey] PRIMARY KEY([report_item_id])
);
--> statement-breakpoint
CREATE TABLE [usage_reports] (
	[report_id] uniqueidentifier CONSTRAINT [usage_reports_report_id_default] DEFAULT (NEWID()),
	[reporter_user_id] uniqueidentifier,
	[reporter_name] nvarchar(150) NOT NULL,
	[reporter_phone] nvarchar(20) NOT NULL,
	[division] nvarchar(100) NOT NULL,
	[activity_name] nvarchar(150) NOT NULL,
	[room_id] int,
	[start_at] datetime2 NOT NULL,
	[planned_end_at] datetime2 NOT NULL,
	[finished_at] datetime2,
	[status] nvarchar(20) NOT NULL CONSTRAINT [usage_reports_status_default] DEFAULT ('BERLANGSUNG'),
	[created_at] datetime2 NOT NULL CONSTRAINT [usage_reports_created_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [usage_reports_pkey] PRIMARY KEY([report_id])
);
--> statement-breakpoint
ALTER TABLE [asset_documents] ADD CONSTRAINT [asset_documents_asset_id_assets_asset_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([asset_id]);--> statement-breakpoint
ALTER TABLE [asset_documents] ADD CONSTRAINT [asset_documents_uploaded_by_users_user_id_fk] FOREIGN KEY ([uploaded_by]) REFERENCES [users]([user_id]) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE [incidents] ADD CONSTRAINT [incidents_asset_id_assets_asset_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([asset_id]);--> statement-breakpoint
ALTER TABLE [incidents] ADD CONSTRAINT [incidents_reported_by_users_user_id_fk] FOREIGN KEY ([reported_by]) REFERENCES [users]([user_id]) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE [maintenance_logs] ADD CONSTRAINT [maintenance_logs_schedule_id_maintenance_schedules_schedule_id_fk] FOREIGN KEY ([schedule_id]) REFERENCES [maintenance_schedules]([schedule_id]);--> statement-breakpoint
ALTER TABLE [maintenance_logs] ADD CONSTRAINT [maintenance_logs_asset_id_assets_asset_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([asset_id]);--> statement-breakpoint
ALTER TABLE [maintenance_schedules] ADD CONSTRAINT [maintenance_schedules_asset_id_assets_asset_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([asset_id]);--> statement-breakpoint
ALTER TABLE [stocktake_items] ADD CONSTRAINT [stocktake_items_period_id_stocktake_periods_period_id_fk] FOREIGN KEY ([period_id]) REFERENCES [stocktake_periods]([period_id]);--> statement-breakpoint
ALTER TABLE [stocktake_items] ADD CONSTRAINT [stocktake_items_asset_id_assets_asset_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([asset_id]);--> statement-breakpoint
ALTER TABLE [stocktake_items] ADD CONSTRAINT [stocktake_items_checked_by_users_user_id_fk] FOREIGN KEY ([checked_by]) REFERENCES [users]([user_id]) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE [stocktake_periods] ADD CONSTRAINT [stocktake_periods_created_by_users_user_id_fk] FOREIGN KEY ([created_by]) REFERENCES [users]([user_id]) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE [usage_report_items] ADD CONSTRAINT [usage_report_items_report_id_usage_reports_report_id_fk] FOREIGN KEY ([report_id]) REFERENCES [usage_reports]([report_id]);--> statement-breakpoint
ALTER TABLE [usage_report_items] ADD CONSTRAINT [usage_report_items_asset_id_assets_asset_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([asset_id]);--> statement-breakpoint
ALTER TABLE [usage_reports] ADD CONSTRAINT [usage_reports_reporter_user_id_users_user_id_fk] FOREIGN KEY ([reporter_user_id]) REFERENCES [users]([user_id]) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE [usage_reports] ADD CONSTRAINT [usage_reports_room_id_rooms_room_id_fk] FOREIGN KEY ([room_id]) REFERENCES [rooms]([room_id]) ON DELETE SET NULL;