CREATE INDEX IF NOT EXISTS `sys_node_status_idx` ON `sys_node` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sys_permission_parent_id_idx` ON `sys_permission` (`parent_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
DELETE FROM `sys_role_permission`
WHERE `role_id` NOT IN (SELECT `id` FROM `sys_role`)
   OR `permission_id` NOT IN (SELECT `id` FROM `sys_permission`);--> statement-breakpoint
DELETE FROM `sys_subscription_node`
WHERE `subscription_id` NOT IN (SELECT `id` FROM `sys_subscription`)
   OR `node_id` NOT IN (SELECT `id` FROM `sys_node`);--> statement-breakpoint
DELETE FROM `sys_subscription_role`
WHERE `subscription_id` NOT IN (SELECT `id` FROM `sys_subscription`)
   OR `role_id` NOT IN (SELECT `id` FROM `sys_role`);--> statement-breakpoint
DELETE FROM `sys_subscription_user`
WHERE `subscription_id` NOT IN (SELECT `id` FROM `sys_subscription`)
   OR `user_id` NOT IN (SELECT `id` FROM `sys_user`);--> statement-breakpoint
DELETE FROM `sys_user_role`
WHERE `user_id` NOT IN (SELECT `id` FROM `sys_user`)
   OR `role_id` NOT IN (SELECT `id` FROM `sys_role`);--> statement-breakpoint
CREATE TABLE `__new_sys_role_permission` (
	`role_id` integer NOT NULL,
	`permission_id` integer NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `sys_permission`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sys_role_permission`("role_id", "permission_id") SELECT "role_id", "permission_id" FROM `sys_role_permission`;--> statement-breakpoint
DROP TABLE `sys_role_permission`;--> statement-breakpoint
ALTER TABLE `__new_sys_role_permission` RENAME TO `sys_role_permission`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sys_role_permission_permission_id_idx` ON `sys_role_permission` (`permission_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sys_subscription_status_idx` ON `sys_subscription` (`status`);--> statement-breakpoint
CREATE TABLE `__new_sys_subscription_node` (
	`subscription_id` integer NOT NULL,
	`node_id` integer NOT NULL,
	PRIMARY KEY(`subscription_id`, `node_id`),
	FOREIGN KEY (`subscription_id`) REFERENCES `sys_subscription`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`node_id`) REFERENCES `sys_node`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sys_subscription_node`("subscription_id", "node_id") SELECT "subscription_id", "node_id" FROM `sys_subscription_node`;--> statement-breakpoint
DROP TABLE `sys_subscription_node`;--> statement-breakpoint
ALTER TABLE `__new_sys_subscription_node` RENAME TO `sys_subscription_node`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sys_subscription_node_node_id_idx` ON `sys_subscription_node` (`node_id`);--> statement-breakpoint
CREATE TABLE `__new_sys_subscription_role` (
	`subscription_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	PRIMARY KEY(`subscription_id`, `role_id`),
	FOREIGN KEY (`subscription_id`) REFERENCES `sys_subscription`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sys_subscription_role`("subscription_id", "role_id") SELECT "subscription_id", "role_id" FROM `sys_subscription_role`;--> statement-breakpoint
DROP TABLE `sys_subscription_role`;--> statement-breakpoint
ALTER TABLE `__new_sys_subscription_role` RENAME TO `sys_subscription_role`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sys_subscription_role_role_id_idx` ON `sys_subscription_role` (`role_id`);--> statement-breakpoint
CREATE TABLE `__new_sys_subscription_user` (
	`subscription_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	PRIMARY KEY(`subscription_id`, `user_id`),
	FOREIGN KEY (`subscription_id`) REFERENCES `sys_subscription`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sys_subscription_user`("subscription_id", "user_id") SELECT "subscription_id", "user_id" FROM `sys_subscription_user`;--> statement-breakpoint
DROP TABLE `sys_subscription_user`;--> statement-breakpoint
ALTER TABLE `__new_sys_subscription_user` RENAME TO `sys_subscription_user`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sys_subscription_user_user_id_idx` ON `sys_subscription_user` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_sys_user_role` (
	`user_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `sys_user`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `sys_role`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sys_user_role`("user_id", "role_id") SELECT "user_id", "role_id" FROM `sys_user_role`;--> statement-breakpoint
DROP TABLE `sys_user_role`;--> statement-breakpoint
ALTER TABLE `__new_sys_user_role` RENAME TO `sys_user_role`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sys_user_role_role_id_idx` ON `sys_user_role` (`role_id`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
