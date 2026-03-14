import { db } from '@/lib/db'
import { sysPermission } from '@/lib/db/schema'
import { ok } from '@/lib/result'
import { asc } from 'drizzle-orm'

interface Permission {
  id: number
  parentId: number
  name: string
  code: string
  type: string
  sort: number
  remark: string | null
}

interface TreeNode extends Permission {
  children: TreeNode[]
}

function buildTree(all: Permission[], parentId: number): TreeNode[] {
  return all
    .filter(p => p.parentId === parentId)
    .map(p => ({
      ...p,
      children: buildTree(all, p.id),
    }))
}

export async function POST() {
  const all = db.select().from(sysPermission).orderBy(asc(sysPermission.sort)).all()
  const tree = buildTree(all, 0)
  return ok(tree)
}
