import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysNode } from '@/lib/db/schema'
import { ok, fail } from '@/lib/result'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, address, port } = body

  if (!name || !address || !port) return fail('名称、地址、端口不能为空')

  await db.insert(sysNode).values(body)

  return ok()
}
