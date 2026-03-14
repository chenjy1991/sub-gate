import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysConfig } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { key } = body

  if (!key) {
    return fail('缺少配置键')
  }

  const row = db.select().from(sysConfig).where(eq(sysConfig.configKey, key)).get()
  if (!row) {
    return ok(null)
  }

  try {
    return ok(JSON.parse(row.configValue))
  } catch {
    return ok(row.configValue)
  }
}
