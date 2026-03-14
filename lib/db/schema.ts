import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

// ========== 实体表 ==========

export const sysUser = sqliteTable('sys_user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  nickname: text('nickname'),
  status: integer('status').notNull().default(1),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString().replace('T', ' ').slice(0, 19)),
})

export const sysRole = sqliteTable('sys_role', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  remark: text('remark'),
  status: integer('status').notNull().default(1),
})

export const sysPermission = sqliteTable('sys_permission', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  parentId: integer('parent_id').notNull().default(0),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  type: text('type').notNull().default('menu'),
  sort: integer('sort').notNull().default(0),
  remark: text('remark'),
})

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
})

export const sysSubscription = sqliteTable('sys_subscription', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  remark: text('remark'),
  status: integer('status').notNull().default(1),
})

// ========== 关联表 ==========

export const sysUserRole = sqliteTable('sys_user_role', {
  userId: integer('user_id').notNull(),
  roleId: integer('role_id').notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.roleId] }),
])

export const sysRolePermission = sqliteTable('sys_role_permission', {
  roleId: integer('role_id').notNull(),
  permissionId: integer('permission_id').notNull(),
}, (table) => [
  primaryKey({ columns: [table.roleId, table.permissionId] }),
])

export const sysSubscriptionNode = sqliteTable('sys_subscription_node', {
  subscriptionId: integer('subscription_id').notNull(),
  nodeId: integer('node_id').notNull(),
}, (table) => [
  primaryKey({ columns: [table.subscriptionId, table.nodeId] }),
])

export const sysSubscriptionRole = sqliteTable('sys_subscription_role', {
  subscriptionId: integer('subscription_id').notNull(),
  roleId: integer('role_id').notNull(),
}, (table) => [
  primaryKey({ columns: [table.subscriptionId, table.roleId] }),
])

export const sysSubscriptionUser = sqliteTable('sys_subscription_user', {
  subscriptionId: integer('subscription_id').notNull(),
  userId: integer('user_id').notNull(),
}, (table) => [
  primaryKey({ columns: [table.subscriptionId, table.userId] }),
])

// ========== 配置表 ==========

export const sysConfig = sqliteTable('sys_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  configKey: text('config_key').notNull().unique(),
  configValue: text('config_value').notNull().default(''),
  remark: text('remark'),
})
