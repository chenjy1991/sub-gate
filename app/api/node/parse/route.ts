import { NextRequest } from 'next/server'
import { ok, fail } from '@/lib/result'
import { parseLinks } from '@/lib/node/parser'

export async function POST(req: NextRequest) {
  const { links } = await req.json()

  if (!links) return fail('链接不能为空')

  const result = parseLinks(links)

  return ok(result)
}
