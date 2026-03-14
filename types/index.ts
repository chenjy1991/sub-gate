export interface AuthUser {
  id: string
  username: string
  email: string
  name: string
  role: 'admin' | 'vip' | 'user'
  status: string
  createdAt: string
  permissions: string[]
}

export interface User {
  id: string
  username: string
  email: string
  nickname: string
  status: number
  createdAt: string
  roleCodes: string[]
}

export interface Role {
  id: string
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
  token: string | null
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
  id: string
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
  id: string
  name: string
  remark: string
  status: number
}

export interface SubscriptionDetail extends Subscription {
  nodes: ProxyNode[]
  nodeIds: string[]
  roleIds: string[]
  userIds: string[]
  roles: Role[]
  users: User[]
}

export interface Permission {
  id: string
  parentId: string
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
  id: string
  name: string
  remark: string
  status: number
  nodeCount: number
}

export interface MySubscriptionDetail {
  id: string
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
