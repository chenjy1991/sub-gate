CREATE TABLE `sys_login_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`ip` text,
	`user_agent` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sys_login_log_user_id_idx` ON `sys_login_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `sys_login_log_created_at_idx` ON `sys_login_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `sys_node_check_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`node_id` integer NOT NULL,
	`is_reachable` integer NOT NULL,
	`latency` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`node_id`) REFERENCES `sys_node`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sys_node_check_log_node_id_idx` ON `sys_node_check_log` (`node_id`);--> statement-breakpoint
CREATE INDEX `sys_node_check_log_created_at_idx` ON `sys_node_check_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `sys_subscription_access_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subscription_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`access_type` text DEFAULT 'base64' NOT NULL,
	`ip` text,
	`user_agent` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `sys_subscription`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sys_subscription_access_log_subscription_id_idx` ON `sys_subscription_access_log` (`subscription_id`);--> statement-breakpoint
CREATE INDEX `sys_subscription_access_log_user_id_idx` ON `sys_subscription_access_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `sys_subscription_access_log_created_at_idx` ON `sys_subscription_access_log` (`created_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sys_node` (
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
	`sort` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_checked_at` text,
	`last_check_status` integer,
	`last_check_latency` integer
);
--> statement-breakpoint
INSERT INTO `__new_sys_node`(
	`id`,
	`name`,
	`address`,
	`port`,
	`protocol`,
	`uuid`,
	`alter_id`,
	`security`,
	`network`,
	`tls`,
	`sni`,
	`path`,
	`host`,
	`raw_link`,
	`remark`,
	`status`,
	`sort`,
	`created_at`,
	`updated_at`,
	`last_checked_at`,
	`last_check_status`,
	`last_check_latency`
)
SELECT
	`id`,
	`name`,
	`address`,
	`port`,
	`protocol`,
	`uuid`,
	`alter_id`,
	`security`,
	`network`,
	`tls`,
	`sni`,
	`path`,
	`host`,
	`raw_link`,
	`remark`,
	`status`,
	`sort`,
	strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'),
	strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'),
	NULL,
	NULL,
	NULL
FROM `sys_node`;--> statement-breakpoint
DROP TABLE `sys_node`;--> statement-breakpoint
ALTER TABLE `__new_sys_node` RENAME TO `sys_node`;--> statement-breakpoint
CREATE INDEX `sys_node_status_idx` ON `sys_node` (`status`);--> statement-breakpoint
CREATE INDEX `sys_node_last_checked_at_idx` ON `sys_node` (`last_checked_at`);--> statement-breakpoint
CREATE TABLE `__new_sys_permission` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parent_id` integer DEFAULT 0 NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`type` text DEFAULT 'menu' NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`remark` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	UNIQUE(`code`)
);
--> statement-breakpoint
INSERT INTO `__new_sys_permission`(
	`id`,
	`parent_id`,
	`name`,
	`code`,
	`type`,
	`sort`,
	`remark`,
	`created_at`,
	`updated_at`
)
SELECT
	`id`,
	`parent_id`,
	`name`,
	`code`,
	`type`,
	`sort`,
	`remark`,
	strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'),
	strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')
FROM `sys_permission`;--> statement-breakpoint
DROP TABLE `sys_permission`;--> statement-breakpoint
ALTER TABLE `__new_sys_permission` RENAME TO `sys_permission`;--> statement-breakpoint
CREATE INDEX `sys_permission_parent_id_idx` ON `sys_permission` (`parent_id`);--> statement-breakpoint
CREATE TABLE `__new_sys_role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`remark` text,
	`status` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	UNIQUE(`code`)
);
--> statement-breakpoint
INSERT INTO `__new_sys_role`(
	`id`,
	`name`,
	`code`,
	`remark`,
	`status`,
	`created_at`,
	`updated_at`
)
SELECT
	`id`,
	`name`,
	`code`,
	`remark`,
	`status`,
	strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'),
	strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')
FROM `sys_role`;--> statement-breakpoint
DROP TABLE `sys_role`;--> statement-breakpoint
ALTER TABLE `__new_sys_role` RENAME TO `sys_role`;--> statement-breakpoint
CREATE TABLE `__new_sys_subscription` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`remark` text,
	`status` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_sys_subscription`(
	`id`,
	`name`,
	`remark`,
	`status`,
	`created_at`,
	`updated_at`
)
SELECT
	`id`,
	`name`,
	`remark`,
	`status`,
	strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'),
	strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')
FROM `sys_subscription`;--> statement-breakpoint
DROP TABLE `sys_subscription`;--> statement-breakpoint
ALTER TABLE `__new_sys_subscription` RENAME TO `sys_subscription`;--> statement-breakpoint
CREATE INDEX `sys_subscription_status_idx` ON `sys_subscription` (`status`);--> statement-breakpoint
CREATE INDEX `sys_subscription_created_at_idx` ON `sys_subscription` (`created_at`);--> statement-breakpoint
CREATE TABLE `__new_sys_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`nickname` text,
	`status` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`activated_at` text,
	`last_login_at` text,
	UNIQUE(`username`),
	UNIQUE(`email`)
);
--> statement-breakpoint
INSERT INTO `__new_sys_user`(
	`id`,
	`username`,
	`email`,
	`password`,
	`nickname`,
	`status`,
	`created_at`,
	`updated_at`,
	`activated_at`,
	`last_login_at`
)
SELECT
	`id`,
	`username`,
	`email`,
	`password`,
	`nickname`,
	`status`,
	`created_at`,
	`created_at`,
	CASE WHEN `status` = 1 THEN `created_at` ELSE NULL END,
	NULL
FROM `sys_user`;--> statement-breakpoint
DROP TABLE `sys_user`;--> statement-breakpoint
ALTER TABLE `__new_sys_user` RENAME TO `sys_user`;--> statement-breakpoint
CREATE INDEX `sys_user_created_at_idx` ON `sys_user` (`created_at`);--> statement-breakpoint
CREATE INDEX `sys_user_last_login_at_idx` ON `sys_user` (`last_login_at`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
