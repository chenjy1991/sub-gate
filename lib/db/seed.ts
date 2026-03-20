import { eq } from 'drizzle-orm'
import { db } from './index'
import { sysUser, sysRole, sysPermission } from './schema'
import { hashPassword } from '../auth'
import { normalizeRoleCode } from '@/lib/role'
import { ensureAdminAuthorizationData } from './bootstrap'
import { runMigrations } from './migrate'

function seedRoles() {
  const existingCodes = new Set(
    db.select({ code: sysRole.code }).from(sysRole).all().map(role => normalizeRoleCode(role.code))
  )

  const missingRoles = [
    { id: 1, name: '管理员', code: 'ADMIN', remark: '系统管理员', status: 1 },
    { id: 2, name: 'VIP用户', code: 'VIP', remark: 'VIP用户', status: 1 },
    { id: 3, name: '注册用户', code: 'USER', remark: '普通注册用户', status: 1 },
  ].filter(role => !existingCodes.has(normalizeRoleCode(role.code)))

  if (missingRoles.length > 0) {
    db.insert(sysRole).values(missingRoles).run()
  }
}

function seedAdmin() {
  const existingAdmin = db
    .select({ id: sysUser.id })
    .from(sysUser)
    .where(eq(sysUser.username, 'admin'))
    .get()

  if (!existingAdmin) {
    const hash = hashPassword('123456')
    db.insert(sysUser).values({
      id: 1,
      username: 'admin',
      email: 'admin@subgate.com',
      password: hash,
      nickname: '管理员',
      status: 1,
    }).run()
  }
}

function seedPermissions() {
  const existing = db.select().from(sysPermission).all()
  if (existing.length > 0) return
  db.insert(sysPermission).values([
    { id: 100000, parentId: 0, name: '数据看板', code: 'dashboard', type: 'menu', sort: 1 },
    { id: 100003, parentId: 0, name: '我的订阅', code: 'my-subscription', type: 'menu', sort: 2 },
    { id: 100002, parentId: 0, name: '业务管理', code: 'service', type: 'menu', sort: 3 },
    { id: 100001, parentId: 0, name: '系统管理', code: 'system', type: 'menu', sort: 4 },
    { id: 100010, parentId: 100001, name: '用户管理', code: 'system:user', type: 'menu', sort: 1 },
    { id: 100011, parentId: 100010, name: '查看用户', code: 'user:list', type: 'button', sort: 1 },
    { id: 100012, parentId: 100010, name: '创建用户', code: 'user:create', type: 'button', sort: 2 },
    { id: 100013, parentId: 100010, name: '编辑用户', code: 'user:update', type: 'button', sort: 3 },
    { id: 100014, parentId: 100010, name: '删除用户', code: 'user:delete', type: 'button', sort: 4 },
    { id: 100020, parentId: 100001, name: '角色管理', code: 'system:role', type: 'menu', sort: 2 },
    { id: 100021, parentId: 100020, name: '查看角色', code: 'role:list', type: 'button', sort: 1 },
    { id: 100022, parentId: 100020, name: '创建角色', code: 'role:create', type: 'button', sort: 2 },
    { id: 100023, parentId: 100020, name: '编辑角色', code: 'role:update', type: 'button', sort: 3 },
    { id: 100024, parentId: 100020, name: '删除角色', code: 'role:delete', type: 'button', sort: 4 },
    { id: 100025, parentId: 100020, name: '分配权限', code: 'role:assign', type: 'button', sort: 5 },
    { id: 100030, parentId: 100001, name: '权限管理', code: 'system:permission', type: 'menu', sort: 3 },
    { id: 100031, parentId: 100030, name: '查看权限', code: 'permission:list', type: 'button', sort: 1 },
    { id: 100032, parentId: 100030, name: '创建权限', code: 'permission:create', type: 'button', sort: 2 },
    { id: 100033, parentId: 100030, name: '编辑权限', code: 'permission:update', type: 'button', sort: 3 },
    { id: 100034, parentId: 100030, name: '删除权限', code: 'permission:delete', type: 'button', sort: 4 },
    { id: 100040, parentId: 100002, name: '节点管理', code: 'service:node', type: 'menu', sort: 1 },
    { id: 100041, parentId: 100040, name: '查看节点', code: 'node:list', type: 'button', sort: 1 },
    { id: 100042, parentId: 100040, name: '创建节点', code: 'node:create', type: 'button', sort: 2 },
    { id: 100043, parentId: 100040, name: '编辑节点', code: 'node:update', type: 'button', sort: 3 },
    { id: 100044, parentId: 100040, name: '删除节点', code: 'node:delete', type: 'button', sort: 4 },
    { id: 100045, parentId: 100040, name: '导入节点', code: 'node:import', type: 'button', sort: 5 },
    { id: 100046, parentId: 100040, name: '检测节点', code: 'node:check', type: 'button', sort: 6 },
    { id: 100050, parentId: 100002, name: '订阅管理', code: 'service:subscription', type: 'menu', sort: 2 },
    { id: 100051, parentId: 100050, name: '查看订阅', code: 'subscription:list', type: 'button', sort: 1 },
    { id: 100052, parentId: 100050, name: '创建订阅', code: 'subscription:create', type: 'button', sort: 2 },
    { id: 100053, parentId: 100050, name: '编辑订阅', code: 'subscription:update', type: 'button', sort: 3 },
    { id: 100054, parentId: 100050, name: '删除订阅', code: 'subscription:delete', type: 'button', sort: 4 },
    { id: 100055, parentId: 100050, name: '分配角色', code: 'subscription:assignRoles', type: 'button', sort: 5 },
    { id: 100056, parentId: 100050, name: '分配用户', code: 'subscription:assignUsers', type: 'button', sort: 6 },
    { id: 100060, parentId: 100001, name: '系统配置', code: 'system:mail', type: 'menu', sort: 4 },
    { id: 100061, parentId: 100060, name: '查看配置', code: 'mail:list', type: 'button', sort: 1 },
    { id: 100062, parentId: 100060, name: '保存配置', code: 'mail:config', type: 'button', sort: 2 },
    { id: 100063, parentId: 100060, name: '发送测试', code: 'mail:test', type: 'button', sort: 3 },
  ]).run()
}

export function seed() {
  runMigrations()
  seedRoles()
  seedAdmin()
  seedPermissions()
  ensureAdminAuthorizationData()
  console.log('数据库初始化完成')
}

// 直接运行时执行
seed()
