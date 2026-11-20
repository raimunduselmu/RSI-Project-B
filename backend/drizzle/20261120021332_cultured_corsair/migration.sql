CREATE TABLE [roles] (
	[role_id] int IDENTITY(1, 1),
	[role_name] nvarchar(20) NOT NULL,
	[description] nvarchar(max),
	CONSTRAINT [roles_pkey] PRIMARY KEY([role_id]),
	CONSTRAINT [roles_role_name_key] UNIQUE([role_name])
);
--> statement-breakpoint
CREATE TABLE [user_roles] (
	[user_role_id] uniqueidentifier CONSTRAINT [user_roles_user_role_id_default] DEFAULT (NEWID()),
	[user_id] uniqueidentifier NOT NULL,
	[role_id] int NOT NULL,
	[officer_id] uniqueidentifier,
	[granted_at] datetime2 NOT NULL CONSTRAINT [user_roles_granted_at_default] DEFAULT (SYSUTCDATETIME()),
	[revoked_at] datetime2,
	CONSTRAINT [user_roles_pkey] PRIMARY KEY([user_role_id])
);
--> statement-breakpoint
CREATE TABLE [users] (
	[user_id] uniqueidentifier CONSTRAINT [users_user_id_default] DEFAULT (NEWID()),
	[full_name] nvarchar(100) NOT NULL,
	[username] nvarchar(50) NOT NULL,
	[email] nvarchar(150),
	[phone] nvarchar(20),
	[division] nvarchar(100),
	[password_hash] nvarchar(255) NOT NULL,
	[must_change_password] bit NOT NULL CONSTRAINT [users_must_change_password_default] DEFAULT ((1)),
	[is_active] bit NOT NULL CONSTRAINT [users_is_active_default] DEFAULT ((1)),
	[failed_attempts] int NOT NULL CONSTRAINT [users_failed_attempts_default] DEFAULT ((0)),
	[locked_until] datetime2,
	[token_version] int NOT NULL CONSTRAINT [users_token_version_default] DEFAULT ((0)),
	[last_login_at] datetime2,
	[created_at] datetime2 NOT NULL CONSTRAINT [users_created_at_default] DEFAULT (SYSUTCDATETIME()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [users_updated_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [users_pkey] PRIMARY KEY([user_id]),
	CONSTRAINT [users_username_key] UNIQUE([username])
);
--> statement-breakpoint
CREATE TABLE [audit_logs] (
	[log_id] uniqueidentifier CONSTRAINT [audit_logs_log_id_default] DEFAULT (NEWID()),
	[user_id] uniqueidentifier,
	[user_email] nvarchar(150),
	[action_type] nvarchar(50) NOT NULL,
	[resource_type] nvarchar(50),
	[resource_id] nvarchar(100),
	[old_values] nvarchar(max),
	[new_values] nvarchar(max),
	[ip_address] varchar(45),
	[user_agent] nvarchar(255),
	[created_at] datetime2 NOT NULL CONSTRAINT [audit_logs_created_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [audit_logs_pkey] PRIMARY KEY([log_id])
);
--> statement-breakpoint
CREATE TABLE [notification_logs] (
	[log_id] uniqueidentifier CONSTRAINT [notification_logs_log_id_default] DEFAULT (NEWID()),
	[notification_id] uniqueidentifier,
	[announcement_id] uniqueidentifier,
	[recipient] nvarchar(150) NOT NULL,
	[channel] nvarchar(20) NOT NULL,
	[subject] nvarchar(150),
	[body] nvarchar(max),
	[status] nvarchar(20) NOT NULL CONSTRAINT [notification_logs_status_default] DEFAULT ('PENDING'),
	[attempts] int NOT NULL CONSTRAINT [notification_logs_attempts_default] DEFAULT ((0)),
	[last_error] nvarchar(255),
	[sent_at] datetime2,
	[created_at] datetime2 NOT NULL CONSTRAINT [notification_logs_created_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [notification_logs_pkey] PRIMARY KEY([log_id])
);
--> statement-breakpoint
CREATE TABLE [notifications] (
	[notification_id] uniqueidentifier CONSTRAINT [notifications_notification_id_default] DEFAULT (NEWID()),
	[recipient_user_id] uniqueidentifier,
	[recipient_email] nvarchar(150),
	[type] nvarchar(50) NOT NULL,
	[title] nvarchar(150) NOT NULL,
	[message] nvarchar(max) NOT NULL,
	[channel] nvarchar(20) NOT NULL,
	[related_id] nvarchar(100),
	[is_read] bit NOT NULL CONSTRAINT [notifications_is_read_default] DEFAULT ((0)),
	[sent_at] datetime2,
	[created_at] datetime2 NOT NULL CONSTRAINT [notifications_created_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [notifications_pkey] PRIMARY KEY([notification_id])
);
--> statement-breakpoint
CREATE TABLE [system_settings] (
	[setting_key] nvarchar(50),
	[setting_value] nvarchar(max) NOT NULL,
	[value_type] nvarchar(10) NOT NULL,
	[is_public] bit NOT NULL CONSTRAINT [system_settings_is_public_default] DEFAULT ((0)),
	[description] nvarchar(255),
	[updated_by] uniqueidentifier,
	[updated_at] datetime2 NOT NULL CONSTRAINT [system_settings_updated_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [system_settings_pkey] PRIMARY KEY([setting_key])
);
--> statement-breakpoint
CREATE TABLE [asset_categories] (
	[category_id] int IDENTITY(1, 1),
	[category_code] nvarchar(30) NOT NULL,
	[category_name] nvarchar(150) NOT NULL,
	[maintenance_default_days] int,
	CONSTRAINT [asset_categories_pkey] PRIMARY KEY([category_id]),
	CONSTRAINT [asset_categories_category_code_key] UNIQUE([category_code])
);
--> statement-breakpoint
CREATE TABLE [asset_histories] (
	[history_id] uniqueidentifier CONSTRAINT [asset_histories_history_id_default] DEFAULT (NEWID()),
	[asset_id] uniqueidentifier NOT NULL,
	[event_type] nvarchar(20) NOT NULL,
	[old_value] nvarchar(max),
	[new_value] nvarchar(max),
	[note] nvarchar(max),
	[actor_user_id] uniqueidentifier,
	[actor_name] nvarchar(150) NOT NULL,
	[created_at] datetime2 NOT NULL CONSTRAINT [asset_histories_created_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [asset_histories_pkey] PRIMARY KEY([history_id])
);
--> statement-breakpoint
CREATE TABLE [assets] (
	[asset_id] uniqueidentifier CONSTRAINT [assets_asset_id_default] DEFAULT (NEWID()),
	[asset_code] nvarchar(30) NOT NULL,
	[asset_name] nvarchar(150) NOT NULL,
	[category_id] int NOT NULL,
	[location_text] nvarchar(100) NOT NULL,
	[asset_condition] nvarchar(20) NOT NULL CONSTRAINT [assets_asset_condition_default] DEFAULT ('BAIK'),
	[status] nvarchar(20) NOT NULL CONSTRAINT [assets_status_default] DEFAULT ('TERSEDIA'),
	[is_lendable] bit NOT NULL CONSTRAINT [assets_is_lendable_default] DEFAULT ((1)),
	[source_type] nvarchar(20) NOT NULL,
	[donor_name] nvarchar(150),
	[acquired_date] date NOT NULL,
	[description] nvarchar(max),
	[photo_path] nvarchar(255),
	[created_by] uniqueidentifier,
	[is_deleted] bit NOT NULL CONSTRAINT [assets_is_deleted_default] DEFAULT ((0)),
	[created_at] datetime2 NOT NULL CONSTRAINT [assets_created_at_default] DEFAULT (SYSUTCDATETIME()),
	[updated_at] datetime2 NOT NULL CONSTRAINT [assets_updated_at_default] DEFAULT (SYSUTCDATETIME()),
	[acquisition_value] decimal(15,2),
	[donation_id] uniqueidentifier,
	CONSTRAINT [assets_pkey] PRIMARY KEY([asset_id]),
	CONSTRAINT [assets_asset_code_key] UNIQUE([asset_code])
);
--> statement-breakpoint
CREATE TABLE [rooms] (
	[room_id] int IDENTITY(1, 1),
	[room_name] nvarchar(150) NOT NULL,
	[capacity] int,
	[description] nvarchar(max),
	[is_active] bit NOT NULL CONSTRAINT [rooms_is_active_default] DEFAULT ((1)),
	CONSTRAINT [rooms_pkey] PRIMARY KEY([room_id]),
	CONSTRAINT [rooms_room_name_key] UNIQUE([room_name])
);
--> statement-breakpoint
CREATE TABLE [loan_items] (
	[loan_item_id] uniqueidentifier CONSTRAINT [loan_items_loan_item_id_default] DEFAULT (NEWID()),
	[loan_id] uniqueidentifier NOT NULL,
	[asset_id] uniqueidentifier NOT NULL,
	[condition_out] nvarchar(20),
	[condition_in] nvarchar(20),
	CONSTRAINT [loan_items_pkey] PRIMARY KEY([loan_item_id])
);
--> statement-breakpoint
CREATE TABLE [loan_requests] (
	[loan_id] uniqueidentifier CONSTRAINT [loan_requests_loan_id_default] DEFAULT (NEWID()),
	[loan_code] nvarchar(30) NOT NULL,
	[request_type] nvarchar(20) NOT NULL,
	[room_id] int,
	[borrower_name] nvarchar(150) NOT NULL,
	[borrower_phone] nvarchar(20) NOT NULL,
	[borrower_email] nvarchar(150) NOT NULL,
	[borrower_org] nvarchar(100),
	[purpose] nvarchar(255) NOT NULL,
	[start_at] datetime2 NOT NULL,
	[end_at] datetime2 NOT NULL,
	[use_facilities] bit NOT NULL CONSTRAINT [loan_requests_use_facilities_default] DEFAULT ((0)),
	[status] nvarchar(20) NOT NULL CONSTRAINT [loan_requests_status_default] DEFAULT ('MENUNGGU'),
	[reviewed_by] uniqueidentifier,
	[reviewed_at] datetime2,
	[reject_reason] nvarchar(max),
	[handed_over_at] datetime2,
	[returned_at] datetime2,
	[return_note] nvarchar(max),
	[created_at] datetime2 NOT NULL CONSTRAINT [loan_requests_created_at_default] DEFAULT (SYSUTCDATETIME()),
	[workflow_id] int,
	[current_step] int CONSTRAINT [loan_requests_current_step_default] DEFAULT ((1)),
	[event_id] uniqueidentifier,
	CONSTRAINT [loan_requests_pkey] PRIMARY KEY([loan_id]),
	CONSTRAINT [loan_requests_loan_code_key] UNIQUE([loan_code])
);
--> statement-breakpoint
CREATE TABLE [approval_logs] (
	[approval_id] uniqueidentifier CONSTRAINT [approval_logs_approval_id_default] DEFAULT (NEWID()),
	[step_id] int NOT NULL,
	[ref_module] nvarchar(50) NOT NULL,
	[ref_id] nvarchar(50) NOT NULL,
	[approver_id] uniqueidentifier NOT NULL,
	[decision] nvarchar(20) NOT NULL,
	[note] nvarchar(max),
	[decided_at] datetime2 NOT NULL CONSTRAINT [approval_logs_decided_at_default] DEFAULT (SYSUTCDATETIME()),
	CONSTRAINT [approval_logs_pkey] PRIMARY KEY([approval_id])
);
--> statement-breakpoint
CREATE TABLE [workflow_steps] (
	[step_id] int IDENTITY(1, 1),
	[workflow_id] int NOT NULL,
	[step_order] int NOT NULL,
	[approver_role] nvarchar(30) NOT NULL,
	[is_required] bit NOT NULL CONSTRAINT [workflow_steps_is_required_default] DEFAULT ((1)),
	[condition] nvarchar(255),
	CONSTRAINT [workflow_steps_pkey] PRIMARY KEY([step_id])
);
--> statement-breakpoint
CREATE TABLE [workflows] (
	[workflow_id] int IDENTITY(1, 1),
	[workflow_name] nvarchar(150) NOT NULL,
	[module] nvarchar(50) NOT NULL,
	[version] int NOT NULL CONSTRAINT [workflows_version_default] DEFAULT ((1)),
	[is_active] bit NOT NULL CONSTRAINT [workflows_is_active_default] DEFAULT ((1)),
	CONSTRAINT [workflows_pkey] PRIMARY KEY([workflow_id]),
	CONSTRAINT [workflows_workflow_name_key] UNIQUE([workflow_name])
);
--> statement-breakpoint
ALTER TABLE [user_roles] ADD CONSTRAINT [user_roles_user_id_users_user_id_fk] FOREIGN KEY ([user_id]) REFERENCES [users]([user_id]) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE [user_roles] ADD CONSTRAINT [user_roles_role_id_roles_role_id_fk] FOREIGN KEY ([role_id]) REFERENCES [roles]([role_id]);--> statement-breakpoint
ALTER TABLE [notifications] ADD CONSTRAINT [notifications_recipient_user_id_users_user_id_fk] FOREIGN KEY ([recipient_user_id]) REFERENCES [users]([user_id]) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE [system_settings] ADD CONSTRAINT [system_settings_updated_by_users_user_id_fk] FOREIGN KEY ([updated_by]) REFERENCES [users]([user_id]);--> statement-breakpoint
ALTER TABLE [asset_histories] ADD CONSTRAINT [asset_histories_asset_id_assets_asset_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([asset_id]);--> statement-breakpoint
ALTER TABLE [asset_histories] ADD CONSTRAINT [asset_histories_actor_user_id_users_user_id_fk] FOREIGN KEY ([actor_user_id]) REFERENCES [users]([user_id]);--> statement-breakpoint
ALTER TABLE [assets] ADD CONSTRAINT [assets_category_id_asset_categories_category_id_fk] FOREIGN KEY ([category_id]) REFERENCES [asset_categories]([category_id]);--> statement-breakpoint
ALTER TABLE [assets] ADD CONSTRAINT [assets_created_by_users_user_id_fk] FOREIGN KEY ([created_by]) REFERENCES [users]([user_id]) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE [loan_items] ADD CONSTRAINT [loan_items_loan_id_loan_requests_loan_id_fk] FOREIGN KEY ([loan_id]) REFERENCES [loan_requests]([loan_id]);--> statement-breakpoint
ALTER TABLE [loan_items] ADD CONSTRAINT [loan_items_asset_id_assets_asset_id_fk] FOREIGN KEY ([asset_id]) REFERENCES [assets]([asset_id]);--> statement-breakpoint
ALTER TABLE [loan_requests] ADD CONSTRAINT [loan_requests_room_id_rooms_room_id_fk] FOREIGN KEY ([room_id]) REFERENCES [rooms]([room_id]) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE [loan_requests] ADD CONSTRAINT [loan_requests_reviewed_by_users_user_id_fk] FOREIGN KEY ([reviewed_by]) REFERENCES [users]([user_id]) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE [loan_requests] ADD CONSTRAINT [loan_requests_workflow_id_workflows_workflow_id_fk] FOREIGN KEY ([workflow_id]) REFERENCES [workflows]([workflow_id]) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE [approval_logs] ADD CONSTRAINT [approval_logs_step_id_workflow_steps_step_id_fk] FOREIGN KEY ([step_id]) REFERENCES [workflow_steps]([step_id]);--> statement-breakpoint
ALTER TABLE [approval_logs] ADD CONSTRAINT [approval_logs_approver_id_users_user_id_fk] FOREIGN KEY ([approver_id]) REFERENCES [users]([user_id]);--> statement-breakpoint
ALTER TABLE [workflow_steps] ADD CONSTRAINT [workflow_steps_workflow_id_workflows_workflow_id_fk] FOREIGN KEY ([workflow_id]) REFERENCES [workflows]([workflow_id]);