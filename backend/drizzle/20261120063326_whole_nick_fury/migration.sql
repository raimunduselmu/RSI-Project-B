CREATE TABLE [divisions] (
	[division_id] int IDENTITY(1, 1),
	[period_id] int NOT NULL,
	[division_name] nvarchar(150) NOT NULL,
	[description] nvarchar(max),
	[role_id] int,
	CONSTRAINT [divisions_pkey] PRIMARY KEY([division_id])
);
--> statement-breakpoint
CREATE TABLE [officers] (
	[officer_id] uniqueidentifier CONSTRAINT [officers_officer_id_default] DEFAULT (NEWID()),
	[member_id] uniqueidentifier NOT NULL,
	[position_id] int NOT NULL,
	[user_id] uniqueidentifier,
	[start_date] date NOT NULL,
	[end_date] date,
	CONSTRAINT [officers_pkey] PRIMARY KEY([officer_id])
);
--> statement-breakpoint
CREATE TABLE [periods] (
	[period_id] int IDENTITY(1, 1),
	[period_name] nvarchar(20) NOT NULL,
	[start_date] date NOT NULL,
	[end_date] date NOT NULL,
	[status] nvarchar(20) NOT NULL CONSTRAINT [periods_status_default] DEFAULT ('AKTIF'),
	[closed_at] datetime2,
	CONSTRAINT [periods_pkey] PRIMARY KEY([period_id]),
	CONSTRAINT [periods_period_name_key] UNIQUE([period_name])
);
--> statement-breakpoint
CREATE TABLE [positions] (
	[position_id] int IDENTITY(1, 1),
	[division_id] int NOT NULL,
	[position_name] nvarchar(150) NOT NULL,
	[is_leader] bit NOT NULL CONSTRAINT [positions_is_leader_default] DEFAULT ((0)),
	[role_id] int,
	CONSTRAINT [positions_pkey] PRIMARY KEY([position_id])
);
--> statement-breakpoint
CREATE TABLE [members] (
	[member_id] uniqueidentifier CONSTRAINT [members_member_id_default] DEFAULT (NEWID()),
	[full_name] nvarchar(100) NOT NULL,
	[member_category] nvarchar(20) NOT NULL,
	[nim_nip] nvarchar(30),
	[phone] nvarchar(20),
	[email] nvarchar(150),
	[faculty] nvarchar(100),
	[entry_year] int,
	[status] nvarchar(20) NOT NULL CONSTRAINT [members_status_default] DEFAULT ('AKTIF'),
	[consent_given] bit NOT NULL CONSTRAINT [members_consent_given_default] DEFAULT ((0)),
	[show_in_directory] bit NOT NULL CONSTRAINT [members_show_in_directory_default] DEFAULT ((0)),
	[user_id] uniqueidentifier,
	[is_deleted] bit NOT NULL CONSTRAINT [members_is_deleted_default] DEFAULT ((0)),
	CONSTRAINT [members_pkey] PRIMARY KEY([member_id])
);
--> statement-breakpoint
CREATE TABLE [budgets] (
	[budget_id] int IDENTITY(1, 1),
	[period_id] int NOT NULL,
	[pos_name] nvarchar(150) NOT NULL,
	[event_id] uniqueidentifier,
	[planned_amount] decimal(15,2) NOT NULL,
	[spent_amount] decimal(15,2) NOT NULL CONSTRAINT [budgets_spent_amount_default] DEFAULT ((0)),
	CONSTRAINT [budgets_pkey] PRIMARY KEY([budget_id])
);
--> statement-breakpoint
CREATE TABLE [cash_transactions] (
	[transaction_id] uniqueidentifier CONSTRAINT [cash_transactions_transaction_id_default] DEFAULT (NEWID()),
	[transaction_type] nvarchar(20) NOT NULL,
	[amount] decimal(15,2) NOT NULL,
	[category] nvarchar(100) NOT NULL,
	[budget_id] int,
	[event_id] uniqueidentifier,
	[transaction_date] date NOT NULL,
	[proof_path] nvarchar(255),
	[period_id] int NOT NULL,
	[source_ref] nvarchar(100),
	[status] nvarchar(25) NOT NULL CONSTRAINT [cash_transactions_status_default] DEFAULT ('DISETUJUI'),
	[description] nvarchar(max),
	[created_by] uniqueidentifier,
	[created_at] datetime2 NOT NULL CONSTRAINT [cash_transactions_created_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [cash_transactions_pkey] PRIMARY KEY([transaction_id])
);
--> statement-breakpoint
CREATE TABLE [kas_dues] (
	[due_id] uniqueidentifier CONSTRAINT [kas_dues_due_id_default] DEFAULT (NEWID()),
	[user_id] uniqueidentifier NOT NULL,
	[period_id] int NOT NULL,
	[due_month] date NOT NULL,
	[amount] decimal(15,2) NOT NULL,
	[status] nvarchar(25) NOT NULL CONSTRAINT [kas_dues_status_default] DEFAULT ('BELUM_LUNAS'),
	CONSTRAINT [kas_dues_pkey] PRIMARY KEY([due_id])
);
--> statement-breakpoint
CREATE TABLE [kas_payment_items] (
	[item_id] uniqueidentifier CONSTRAINT [kas_payment_items_item_id_default] DEFAULT (NEWID()),
	[payment_id] uniqueidentifier NOT NULL,
	[due_id] uniqueidentifier NOT NULL,
	[amount] decimal(15,2) NOT NULL,
	CONSTRAINT [kas_payment_items_pkey] PRIMARY KEY([item_id])
);
--> statement-breakpoint
CREATE TABLE [kas_payments] (
	[payment_id] uniqueidentifier CONSTRAINT [kas_payments_payment_id_default] DEFAULT (NEWID()),
	[payment_code] nvarchar(30) NOT NULL,
	[user_id] uniqueidentifier NOT NULL,
	[period_id] int NOT NULL,
	[method] nvarchar(10) NOT NULL,
	[total_amount] decimal(15,2) NOT NULL,
	[proof_path] nvarchar(255) NOT NULL,
	[note] nvarchar(255),
	[status] nvarchar(25) NOT NULL CONSTRAINT [kas_payments_status_default] DEFAULT ('MENUNGGU_VERIFIKASI'),
	[reject_reason] nvarchar(255),
	[verified_by] uniqueidentifier,
	[verified_at] datetime2,
	[cash_transaction_id] uniqueidentifier,
	[created_at] datetime2 NOT NULL CONSTRAINT [kas_payments_created_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [kas_payments_pkey] PRIMARY KEY([payment_id]),
	CONSTRAINT [kas_payments_payment_code_key] UNIQUE([payment_code])
);
--> statement-breakpoint
ALTER TABLE [divisions] ADD CONSTRAINT [divisions_period_id_periods_period_id_fk] FOREIGN KEY ([period_id]) REFERENCES [periods]([period_id]);--> statement-breakpoint
ALTER TABLE [divisions] ADD CONSTRAINT [divisions_role_id_roles_role_id_fk] FOREIGN KEY ([role_id]) REFERENCES [roles]([role_id]);--> statement-breakpoint
ALTER TABLE [officers] ADD CONSTRAINT [officers_member_id_members_member_id_fk] FOREIGN KEY ([member_id]) REFERENCES [members]([member_id]);--> statement-breakpoint
ALTER TABLE [officers] ADD CONSTRAINT [officers_position_id_positions_position_id_fk] FOREIGN KEY ([position_id]) REFERENCES [positions]([position_id]);--> statement-breakpoint
ALTER TABLE [officers] ADD CONSTRAINT [officers_user_id_users_user_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([user_id]);--> statement-breakpoint
ALTER TABLE [positions] ADD CONSTRAINT [positions_division_id_divisions_division_id_fk] FOREIGN KEY ([division_id]) REFERENCES [divisions]([division_id]);--> statement-breakpoint
ALTER TABLE [positions] ADD CONSTRAINT [positions_role_id_roles_role_id_fk] FOREIGN KEY ([role_id]) REFERENCES [roles]([role_id]);--> statement-breakpoint
ALTER TABLE [members] ADD CONSTRAINT [members_user_id_users_user_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([user_id]);--> statement-breakpoint
ALTER TABLE [budgets] ADD CONSTRAINT [budgets_period_id_periods_period_id_fk] FOREIGN KEY ([period_id]) REFERENCES [periods]([period_id]);--> statement-breakpoint
ALTER TABLE [cash_transactions] ADD CONSTRAINT [cash_transactions_budget_id_budgets_budget_id_fk] FOREIGN KEY ([budget_id]) REFERENCES [budgets]([budget_id]);--> statement-breakpoint
ALTER TABLE [cash_transactions] ADD CONSTRAINT [cash_transactions_period_id_periods_period_id_fk] FOREIGN KEY ([period_id]) REFERENCES [periods]([period_id]);--> statement-breakpoint
ALTER TABLE [cash_transactions] ADD CONSTRAINT [cash_transactions_created_by_users_user_id_fk] FOREIGN KEY ([created_by]) REFERENCES [users]([user_id]);--> statement-breakpoint
ALTER TABLE [kas_dues] ADD CONSTRAINT [kas_dues_user_id_users_user_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([user_id]);--> statement-breakpoint
ALTER TABLE [kas_dues] ADD CONSTRAINT [kas_dues_period_id_periods_period_id_fk] FOREIGN KEY ([period_id]) REFERENCES [periods]([period_id]);--> statement-breakpoint
ALTER TABLE [kas_payment_items] ADD CONSTRAINT [kas_payment_items_payment_id_kas_payments_payment_id_fk] FOREIGN KEY ([payment_id]) REFERENCES [kas_payments]([payment_id]);--> statement-breakpoint
ALTER TABLE [kas_payment_items] ADD CONSTRAINT [kas_payment_items_due_id_kas_dues_due_id_fk] FOREIGN KEY ([due_id]) REFERENCES [kas_dues]([due_id]);--> statement-breakpoint
ALTER TABLE [kas_payments] ADD CONSTRAINT [kas_payments_user_id_users_user_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([user_id]);--> statement-breakpoint
ALTER TABLE [kas_payments] ADD CONSTRAINT [kas_payments_period_id_periods_period_id_fk] FOREIGN KEY ([period_id]) REFERENCES [periods]([period_id]);--> statement-breakpoint
ALTER TABLE [kas_payments] ADD CONSTRAINT [kas_payments_verified_by_users_user_id_fk] FOREIGN KEY ([verified_by]) REFERENCES [users]([user_id]);--> statement-breakpoint
ALTER TABLE [kas_payments] ADD CONSTRAINT [kas_payments_cash_transaction_id_cash_transactions_transaction_id_fk] FOREIGN KEY ([cash_transaction_id]) REFERENCES [cash_transactions]([transaction_id]);