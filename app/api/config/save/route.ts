import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysConfig } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { key, value, remark } = body

  if (!key) {
    return fail('缺少配置键')
  }

  const valueStr = typeof value === 'string' ? value : JSON.stringify(value)
  const existing = db.select().from(sysConfig).where(eq(sysConfig.configKey, key)).get()

  if (existing) {
    db.update(sysConfig).set({
      configValue: valueStr,
      remark: remark ?? existing.remark,
    }).where(eq(sysConfig.configKey, key)).run()
  } else {
    db.insert(sysConfig).values({
      configKey: key,
      configValue: valueStr,
      remark: remark ?? null,
    }).run()
  }

  return ok()
}
