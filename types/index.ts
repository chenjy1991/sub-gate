export type EntityId = number

export interface AuthUser {
  id: EntityId
  username: string
  email: string
  name: string
  role: 'admin' | 'vip' | 'user'
  status: string
  createdAt: string
  permissions: string[]
}

export interface User {
  id: EntityId
  username: string
  email: string
  nickname: string
  status: number
  createdAt: string
  roleCodes: string[]
}

export interface Role {
  id: EntityId
  name: string
  code: string
  remark: string
  status: number
}

export interface LoginForm {
  username: string
  password: string
}

export interface AuthState {
  user: AuthUser | null
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRoles: number
  todayLogins: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface ProxyNode {
  id: EntityId
  name: string
  address: string
  port: number
  protocol: string
  uuid: string
  alterId: number
  security: string
  network: string
  tls: number
  sni: string
  path: string
  host: string
  rawLink: string
  remark: string
  status: number
  sort: number
}

export interface ParseResult {
  success: Omit<ProxyNode, 'id'>[]
  failed: { line: number; raw: string; error: string }[]
}

export interface Subscription {
  id: EntityId
  name: string
  remark: string
  status: number
}

export interface SubscriptionDetail extends Subscription {
  nodes: ProxyNode[]
  nodeIds: EntityId[]
  roleIds: EntityId[]
  userIds: EntityId[]
  roles: Role[]
  users: User[]
}

export interface Permission {
  id: EntityId
  parentId: EntityId
  name: string
  code: string
  type: 'menu' | 'button'
  sort: number
  remark: string
}

export interface PermissionTreeNode extends Permission {
  children: PermissionTreeNode[]
}

export interface MySubscription {
  id: EntityId
  name: string
  remark: string
  status: number
  nodeCount: number
}

export interface MySubscriptionDetail {
  id: EntityId
  name: string
  remark: string
  nodes: ProxyNode[]
}

export interface MailConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

export interface SiteConfig {
  domain: string
  name: string
}
