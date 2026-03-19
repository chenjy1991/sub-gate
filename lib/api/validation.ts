import { z } from 'zod'
import { fail } from '@/lib/result'

export function createIdSchema(label: string) {
  return z.coerce.number().int(`${label}必须是整数`).positive(`${label}必须大于0`)
}

export const pageSchema = z.coerce.number().int('页码必须是整数').min(1, '页码必须大于0')
export const sizeSchema = z.coerce.number().int('每页条数必须是整数').min(1, '每页条数必须大于0').max(100, '每页条数不能超过100')
export const statusSchema = z.coerce.number().int('状态必须是整数').refine(value => value === 0 || value === 1, '状态只能是 0 或 1')
export const portSchema = z.coerce.number().int('端口必须是整数').min(1, '端口必须大于0').max(65535, '端口不能超过 65535')
export const usernameSchema = z.string().trim().min(1, '用户名不能为空').regex(/^[a-zA-Z][a-zA-Z0-9]*$/, '用户名只能包含英文和数字，且必须英文开头')
export const emailSchema = z.string().trim().min(1, '邮箱不能为空').email('邮箱格式不正确')
export const passwordSchema = z.string().min(6, '密码至少6个字符')

export function optionalTextSchema(label: string) {
  return z.string().trim().max(255, `${label}长度不能超过255`).optional().nullable()
}

export function normalizeOptionalText(value: string | null | undefined): string | null | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema
): Promise<
  | { success: true; data: z.infer<TSchema> }
  | { success: false; response: ReturnType<typeof fail> }
> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return {
      success: false,
      response: fail('请求体格式错误'),
    }
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      success: false,
      response: fail(result.error.issues[0]?.message || '请求参数不合法'),
    }
  }

  return {
    success: true,
    data: result.data,
  }
}
