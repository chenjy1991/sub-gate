import { z } from 'zod'
import {
  createIdSchema,
  emailSchema,
  normalizeOptionalText,
  optionalTextSchema,
  pageSchema,
  passwordSchema,
  portSchema,
  sizeSchema,
  statusSchema,
  usernameSchema,
} from './validation'

const nullableTextSchema = z.string().trim().optional().nullable()
  .transform(value => normalizeOptionalText(value))

export const paginationSchema = z.object({
  page: pageSchema.default(1),
  size: sizeSchema.default(10),
})

export function createEntityIdSchema(label: string) {
  return z.object({
    id: createIdSchema(label),
  })
}

export function createIdArraySchema(label: string) {
  return z.array(createIdSchema(label)).default([])
}

export const loginSchema = z.object({
  username: z.string().trim().min(1, '账号和密码不能为空'),
  password: z.string().min(1, '账号和密码不能为空'),
})

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const rolePayloadSchema = z.object({
  name: z.string().trim().min(1, '角色名称不能为空'),
  code: z.string().trim().min(1, '角色编码不能为空'),
  remark: optionalTextSchema('备注').transform(value => normalizeOptionalText(value)),
  status: statusSchema.default(1),
})

export const permissionPayloadSchema = z.object({
  parentId: z.coerce.number().int('父级权限ID必须是整数').min(0, '父级权限ID不能小于0').default(0),
  name: z.string().trim().min(1, '权限名称不能为空'),
  code: z.string().trim().min(1, '权限编码不能为空'),
  type: z.enum(['menu', 'button']).default('menu'),
  sort: z.coerce.number().int('排序必须是整数').min(0, '排序不能小于0').default(0),
  remark: optionalTextSchema('备注').transform(value => normalizeOptionalText(value)),
})

export const nodePayloadSchema = z.object({
  name: z.string().trim().min(1, '名称不能为空'),
  address: z.string().trim().min(1, '地址不能为空'),
  port: portSchema,
  protocol: z.string().trim().min(1, '协议不能为空'),
  uuid: nullableTextSchema,
  alterId: z.coerce.number().int('alterId 必须是整数').min(0, 'alterId 不能小于0').default(0),
  security: nullableTextSchema,
  network: nullableTextSchema,
  tls: statusSchema.default(0),
  sni: nullableTextSchema,
  path: nullableTextSchema,
  host: nullableTextSchema,
  rawLink: nullableTextSchema,
  remark: nullableTextSchema,
  status: statusSchema.default(1),
  sort: z.coerce.number().int('排序必须是整数').min(0, '排序不能小于0').default(0),
})

export const subscriptionPayloadSchema = z.object({
  name: z.string().trim().min(1, '订阅名称不能为空'),
  remark: optionalTextSchema('备注').transform(value => normalizeOptionalText(value)),
  status: statusSchema.default(1),
  nodeIds: createIdArraySchema('节点ID').optional().default([]),
})

export const siteConfigSchema = z.object({
  domain: z.string().trim().url('站点域名格式不正确'),
  name: z.string().trim().min(1, '站点名称不能为空'),
})

export const mailConfigSchema = z.object({
  host: z.string().trim().min(1, 'SMTP 服务器地址不能为空'),
  port: portSchema,
  secure: z.boolean(),
  user: emailSchema,
  pass: z.string().trim().min(1, 'SMTP 授权码或密码不能为空'),
  from: z.string().trim().min(1, '发件人显示名称不能为空'),
})
