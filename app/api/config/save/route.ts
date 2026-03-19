import { NextRequest } from 'next/server'
import { z } from 'zod'
import { mailConfigSchema, siteConfigSchema } from '@/lib/api/schemas'
import { requireRequestAuth } from '@/lib/api/auth'
import { normalizeOptionalText, parseJsonBody } from '@/lib/api/validation'
import { db } from '@/lib/db'
import { sysConfig } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { eq } from 'drizzle-orm'

const saveConfigSchema = z.discriminatedUnion('key', [
  z.object({
    key: z.literal('mail'),
    value: mailConfigSchema,
    remark: z.string().trim().optional().nullable(),
  }),
  z.object({
    key: z.literal('site'),
    value: siteConfigSchema,
    remark: z.string().trim().optional().nullable(),
  }),
])

export async function POST(request: NextRequest) {
  const guard = await requireRequestAuth('mail:config')
  if (guard.response) {
    return guard.response
  }

  const parsed = await parseJsonBody(request, saveConfigSchema)
  if (!parsed.success) {
    return parsed.response
  }

  const { key, value, remark } = parsed.data
  const valueStr = JSON.stringify(value)
  const existing = db.select().from(sysConfig).where(eq(sysConfig.configKey, key)).get()

  if (existing) {
    db.update(sysConfig).set({
      configValue: valueStr,
      remark: normalizeOptionalText(remark) ?? existing.remark,
    }).where(eq(sysConfig.configKey, key)).run()
  } else {
    db.insert(sysConfig).values({
      configKey: key,
      configValue: valueStr,
      remark: normalizeOptionalText(remark) ?? null,
    }).run()
  }

  return ok()
}
