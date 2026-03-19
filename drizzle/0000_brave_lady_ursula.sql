CREATE TABLE IF NOT EXISTS `sys_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`config_key` text NOT NULL,
	`config_value` text DEFAULT '' NOT NULL,
	`remark` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `sys_config_config_key_unique` ON `sys_config` (`config_key`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sys_node` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`port` integer NOT NULL,
	`protocol` text NOT NULL,
	`uuid` text,
	`alter_id` integer DEFAULT 0,
	`security` text,
	`network` text,
	`tls` integer DEFAULT 0,
	`sni` text,
	`path` text,
	`host` text,
	`raw_link` text,
	`remark` text,
	`status` integer DEFAULT 1,
	`sort` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sys_permission` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parent_id` integer DEFAULT 0 NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`type` text DEFAULT 'menu' NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`remark` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `sys_permission_code_unique` ON `sys_permission` (`code`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sys_role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`remark` text,
	`status` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `sys_role_code_unique` ON `sys_role` (`code`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sys_role_permission` (
	`role_id` integer NOT NULL,
	`permission_id` integer NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sys_subscription` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`remark` text,
	`status` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sys_subscription_node` (
	`subscription_id` integer NOT NULL,
	`node_id` integer NOT NULL,
	PRIMARY KEY(`subscription_id`, `node_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sys_subscription_role` (
	`subscription_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	PRIMARY KEY(`subscription_id`, `role_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sys_subscription_user` (
	`subscription_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	PRIMARY KEY(`subscription_id`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sys_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`nickname` text,
	`status` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `sys_user_username_unique` ON `sys_user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `sys_user_email_unique` ON `sys_user` (`email`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sys_user_role` (
	`user_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `role_id`)
);
