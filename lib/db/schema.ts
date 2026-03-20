import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core'
import { getCurrentDateTime } from '@/lib/datetime'

// ========== 实体表 ==========

export const sysUser = sqliteTable('sys_user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  nickname: text('nickname'),
  status: integer('status').notNull().default(1),
  createdAt: text('created_at').notNull().$defaultFn(getCurrentDateTime),
  updatedAt: text('updated_at').notNull().$defaultFn(getCurrentDateTime),
  activatedAt: text('activated_at'),
  lastLoginAt: text('last_login_at'),
}, (table) => [
  index('sys_user_created_at_idx').on(table.createdAt),
  index('sys_user_last_login_at_idx').on(table.lastLoginAt),
])

export const sysRole = sqliteTable('sys_role', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  remark: text('remark'),
  status: integer('status').notNull().default(1),
  createdAt: text('created_at').notNull().$defaultFn(getCurrentDateTime),
  updatedAt: text('updated_at').notNull().$defaultFn(getCurrentDateTime),
})

export const sysPermission = sqliteTable('sys_permission', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  parentId: integer('parent_id').notNull().default(0),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  type: text('type').notNull().default('menu'),
  sort: integer('sort').notNull().default(0),
  remark: text('remark'),
  createdAt: text('created_at').notNull().$defaultFn(getCurrentDateTime),
  updatedAt: text('updated_at').notNull().$defaultFn(getCurrentDateTime),
}, (table) => [
  index('sys_permission_parent_id_idx').on(table.parentId),
])

export const sysNode = sqliteTable('sys_node', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  address: text('address').notNull(),
  port: integer('port').notNull(),
  protocol: text('protocol').notNull(),
  uuid: text('uuid'),
  alterId: integer('alter_id').default(0),
  security: text('security'),
  network: text('network'),
  tls: integer('tls').default(0),
  sni: text('sni'),
  path: text('path'),
  host: text('host'),
  rawLink: text('raw_link'),
  remark: text('remark'),
  status: integer('status').default(1),
  sort: integer('sort').default(0),
  createdAt: text('created_at').notNull().$defaultFn(getCurrentDateTime),
  updatedAt: text('updated_at').notNull().$defaultFn(getCurrentDateTime),
  lastCheckedAt: text('last_checked_at'),
  lastCheckStatus: integer('last_check_status'),
  lastCheckLatency: integer('last_check_latency'),
}, (table) => [
  index('sys_node_status_idx').on(table.status),
  index('sys_node_last_checked_at_idx').on(table.lastCheckedAt),
])

export const sysSubscription = sqliteTable('sys_subscription', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  remark: text('remark'),
  status: integer('status').notNull().default(1),
  createdAt: text('created_at').notNull().$defaultFn(getCurrentDateTime),
  updatedAt: text('updated_at').notNull().$defaultFn(getCurrentDateTime),
}, (table) => [
  index('sys_subscription_status_idx').on(table.status),
  index('sys_subscription_created_at_idx').on(table.createdAt),
])

// ========== 关联表 ==========

export const sysUserRole = sqliteTable('sys_user_role', {
  userId: integer('user_id').notNull().references(() => sysUser.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => sysRole.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.userId, table.roleId] }),
  index('sys_user_role_role_id_idx').on(table.roleId),
])

export const sysRolePermission = sqliteTable('sys_role_permission', {
  roleId: integer('role_id').notNull().references(() => sysRole.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  permissionId: integer('permission_id').notNull().references(() => sysPermission.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.roleId, table.permissionId] }),
  index('sys_role_permission_permission_id_idx').on(table.permissionId),
])

export const sysSubscriptionNode = sqliteTable('sys_subscription_node', {
  subscriptionId: integer('subscription_id').notNull().references(() => sysSubscription.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  nodeId: integer('node_id').notNull().references(() => sysNode.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.subscriptionId, table.nodeId] }),
  index('sys_subscription_node_node_id_idx').on(table.nodeId),
])

export const sysSubscriptionRole = sqliteTable('sys_subscription_role', {
  subscriptionId: integer('subscription_id').notNull().references(() => sysSubscription.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => sysRole.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.subscriptionId, table.roleId] }),
  index('sys_subscription_role_role_id_idx').on(table.roleId),
])

export const sysSubscriptionUser = sqliteTable('sys_subscription_user', {
  subscriptionId: integer('subscription_id').notNull().references(() => sysSubscription.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userId: integer('user_id').notNull().references(() => sysUser.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.subscriptionId, table.userId] }),
  index('sys_subscription_user_user_id_idx').on(table.userId),
])

export const sysLoginLog = sqliteTable('sys_login_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => sysUser.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull().$defaultFn(getCurrentDateTime),
}, (table) => [
  index('sys_login_log_user_id_idx').on(table.userId),
  index('sys_login_log_created_at_idx').on(table.createdAt),
])

export const sysNodeCheckLog = sqliteTable('sys_node_check_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nodeId: integer('node_id').notNull().references(() => sysNode.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  isReachable: integer('is_reachable').notNull(),
  latency: integer('latency').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(getCurrentDateTime),
}, (table) => [
  index('sys_node_check_log_node_id_idx').on(table.nodeId),
  index('sys_node_check_log_created_at_idx').on(table.createdAt),
])

export const sysSubscriptionAccessLog = sqliteTable('sys_subscription_access_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subscriptionId: integer('subscription_id').notNull().references(() => sysSubscription.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userId: integer('user_id').notNull().references(() => sysUser.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  accessType: text('access_type').notNull().default('base64'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull().$defaultFn(getCurrentDateTime),
}, (table) => [
  index('sys_subscription_access_log_subscription_id_idx').on(table.subscriptionId),
  index('sys_subscription_access_log_user_id_idx').on(table.userId),
  index('sys_subscription_access_log_created_at_idx').on(table.createdAt),
])

// ========== 配置表 ==========

export const sysConfig = sqliteTable('sys_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  configKey: text('config_key').notNull().unique(),
  configValue: text('config_value').notNull().default(''),
  remark: text('remark'),
})
