import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { sysUser, sysSubscription, sysSubscriptionNode, sysSubscriptionRole, sysSubscriptionUser, sysUserRole, sysNode } from '@/lib/db/schema'
import { eq, inArray, and } from 'drizzle-orm'
import { generateBase64, generateClash, generateSurge, generateQuantumultX } from '@/lib/node/subscription'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // Decode token: base64url → "userId:subscriptionId"
  let userId: number
  let subscriptionId: number
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const [userPart, subPart] = decoded.split(':')
    userId = Number(userPart)
    subscriptionId = Number(subPart)
    if (isNaN(userId) || isNaN(subscriptionId)) throw new Error()
  } catch {
    return new Response('无效的订阅链接', { status: 400 })
  }

  // Validate user
  const user = db.select().from(sysUser).where(eq(sysUser.id, userId)).get()
  if (!user || user.status === 0) {
    return new Response('用户不存在或已禁用', { status: 403 })
  }

  // Validate subscription
  const sub = db.select().from(sysSubscription).where(eq(sysSubscription.id, subscriptionId)).get()
  if (!sub || sub.status === 0) {
    return new Response('订阅不存在或已禁用', { status: 403 })
  }

  // Check access: direct user assignment
  const directAccess = db
    .select()
    .from(sysSubscriptionUser)
    .where(eq(sysSubscriptionUser.subscriptionId, subscriptionId))
    .all()
    .some(r => r.userId === userId)

  let roleAccess = false
  if (!directAccess) {
    const userRoleIds = db
      .select({ roleId: sysUserRole.roleId })
      .from(sysUserRole)
      .where(eq(sysUserRole.userId, userId))
      .all()
      .map(r => r.roleId)

    if (userRoleIds.length > 0) {
      roleAccess = db
        .select()
        .from(sysSubscriptionRole)
        .where(eq(sysSubscriptionRole.subscriptionId, subscriptionId))
        .all()
        .some(r => userRoleIds.includes(r.roleId))
    }
  }

  if (!directAccess && !roleAccess) {
    return new Response('无权访问该订阅', { status: 403 })
  }

  // Get nodes
  const nodeIds = db
    .select({ nodeId: sysSubscriptionNode.nodeId })
    .from(sysSubscriptionNode)
    .where(eq(sysSubscriptionNode.subscriptionId, subscriptionId))
    .all()
    .map(r => r.nodeId)

  const nodes = nodeIds.length > 0
    ? db.select().from(sysNode).where(and(inArray(sysNode.id, nodeIds), eq(sysNode.status, 1))).all()
    : []

  // Generate content based on type
  const type = request.nextUrl.searchParams.get('type') || 'base64'
  let content: string
  let contentType: string

  switch (type) {
    case 'clash':
      content = generateClash(nodes, sub.name)
      contentType = 'text/yaml; charset=utf-8'
      break
    case 'surge':
      content = generateSurge(nodes, sub.name)
      contentType = 'text/plain; charset=utf-8'
      break
    case 'quantumultx':
    case 'quanx':
      content = generateQuantumultX(nodes)
      contentType = 'text/plain; charset=utf-8'
      break
    default:
      content = generateBase64(nodes)
      contentType = 'text/plain; charset=utf-8'
      break
  }

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'subscription-userinfo': 'upload=0; download=0; total=0; expire=0',
      'content-disposition': `inline; filename*=UTF-8''${encodeURIComponent(sub.name)}`,
    },
  })
}
