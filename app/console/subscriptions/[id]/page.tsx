'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSubscriptionDetail, assignSubscriptionRoles, assignSubscriptionUsers } from '@/services/subscriptions'
import { getRoles } from '@/services/roles'
import { getUsers } from '@/services/users'
import { useAuthStore } from '@/store/authStore'
import type { SubscriptionDetail, Role, User } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Pencil, Check, Search, Copy } from 'lucide-react'
import { PermGuard } from '@/components/common/PermGuard'
import { cn } from '@/lib/utils'

const CLIENT_TYPES = [
  { key: 'base64', label: '通用' },
  { key: 'clash', label: 'Clash' },
  { key: 'surge', label: 'Surge' },
  { key: 'shadowrocket', label: 'Shadowrocket' },
  { key: 'quantumultx', label: 'QuantumultX' },
] as const

function generateToken(userId: string, subscriptionId: string): string {
  const payload = `${userId}:${subscriptionId}`
  return btoa(payload).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function getSubscribeUrl(userId: string, subscriptionId: string, type: string): string {
  const token = generateToken(userId, subscriptionId)
  return `${window.location.origin}/api/subscribe/${token}?type=${type}`
}

export default function SubscriptionDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore(s => s.user)
  const [detail, setDetail] = useState<SubscriptionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // 分配角色弹窗
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  // 分配用户弹窗
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [dialogUsers, setDialogUsers] = useState<User[]>([])
  const [dialogUserTotal, setDialogUserTotal] = useState(0)
  const [dialogUserPage, setDialogUserPage] = useState(1)
  const [dialogUserSearch, setDialogUserSearch] = useState('')
  const [dialogUserKeyword, setDialogUserKeyword] = useState('')
  const [dialogUserLoading, setDialogUserLoading] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const dialogUserPageSize = 10

  const fetchDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getSubscriptionDetail(id)
      setDetail(data)
      setSelectedRoleIds(data.roleIds ?? [])
      setSelectedUserIds(data.userIds ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDetail() }, [id])

  const openRoleDialog = async () => {
    const res = await getRoles({ page: 1, size: 100 })
    setAllRoles(res.list)
    setRoleDialogOpen(true)
  }

  const fetchDialogUsers = async (page: number, keyword: string) => {
    setDialogUserLoading(true)
    try {
      const res = await getUsers({ page, size: dialogUserPageSize, username: keyword || undefined })
      setDialogUsers(res.list)
      setDialogUserTotal(res.total)
    } finally {
      setDialogUserLoading(false)
    }
  }

  const openUserDialog = async () => {
    setDialogUserPage(1)
    setDialogUserSearch('')
    setDialogUserKeyword('')
    setUserDialogOpen(true)
    await fetchDialogUsers(1, '')
  }

  const handleUserSearch = () => {
    setDialogUserPage(1)
    setDialogUserKeyword(dialogUserSearch)
    fetchDialogUsers(1, dialogUserSearch)
  }

  const handleUserPageChange = (newPage: number) => {
    setDialogUserPage(newPage)
    fetchDialogUsers(newPage, dialogUserKeyword)
  }

  const toggleUserId = (uid: string) => {
    setSelectedUserIds(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid])
  }

  const saveRoles = async () => {
    if (!id) return
    await assignSubscriptionRoles(id, selectedRoleIds)
    setRoleDialogOpen(false)
    fetchDetail()
  }

  const saveUsers = async () => {
    if (!id) return
    await assignSubscriptionUsers(id, selectedUserIds)
    setUserDialogOpen(false)
    fetchDetail()
  }

  const handleCopy = async (type: string) => {
    if (!user || !id) return
    const url = getSubscribeUrl(user.id, id, type)
    await navigator.clipboard.writeText(url)
    setCopiedKey(type)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (loading || !detail) {
    return <div className="flex h-40 items-center justify-center text-zinc-400">加载中...</div>
  }

  const dialogUserTotalPages = Math.ceil(dialogUserTotal / dialogUserPageSize)

  return (
    <PermGuard code="service:subscription">
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/console/subscriptions')}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-xl font-semibold">订阅详情</h1>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => router.push(`/console/subscriptions/${id}/edit`)}>
          <Pencil size={14} className="mr-1" /> 编辑
        </Button>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-zinc-500">名称：</span>{detail.name}</div>
            <div><span className="text-zinc-500">状态：</span>
              <Badge variant={detail.status === 1 ? 'default' : 'secondary'}>
                {detail.status === 1 ? '启用' : '禁用'}
              </Badge>
            </div>
            <div className="col-span-2"><span className="text-zinc-500">备注：</span>{detail.remark || '-'}</div>
          </div>
        </CardContent>
      </Card>

      {/* 订阅链接 */}
      {user && (
        <Card>
          <CardHeader><CardTitle className="text-base">订阅链接</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CLIENT_TYPES.map(({ key, label }) => {
                const isCopied = copiedKey === key
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(key)}
                  >
                    {isCopied ? <Check size={14} className="mr-1 text-green-600" /> : <Copy size={14} className="mr-1" />}
                    {isCopied ? '已复制' : label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 关联节点 */}
      <Card>
        <CardHeader><CardTitle className="text-base">关联节点（{(detail.nodes ?? []).length} 个）</CardTitle></CardHeader>
        <CardContent>
          {(detail.nodes ?? []).length === 0 ? (
            <div className="text-center text-zinc-400 py-4 text-sm">暂无关联节点</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>地址</TableHead>
                    <TableHead>协议</TableHead>
                    <TableHead>传输</TableHead>
                    <TableHead>TLS</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.nodes.map(node => (
                    <TableRow key={node.id}>
                      <TableCell className="font-medium">{node.name}</TableCell>
                      <TableCell className="text-zinc-500">{node.address}:{node.port}</TableCell>
                      <TableCell><Badge variant="outline">{node.protocol}</Badge></TableCell>
                      <TableCell className="text-zinc-500">{node.network || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={node.tls === 1 ? 'default' : 'secondary'}>{node.tls === 1 ? '是' : '否'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={node.status === 1 ? 'default' : 'secondary'}>{node.status === 1 ? '启用' : '禁用'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分配角色 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">已分配角色</CardTitle>
            <Button variant="outline" size="sm" onClick={openRoleDialog}>分配角色</Button>
          </div>
        </CardHeader>
        <CardContent>
          {(detail.roles ?? []).length === 0 ? (
            <div className="text-center text-zinc-400 py-4 text-sm">暂未分配角色</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {detail.roles.map(role => (
                <Badge key={role.id} variant="outline">{role.name}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分配用户 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">已分配用户</CardTitle>
            <Button variant="outline" size="sm" onClick={openUserDialog}>分配用户</Button>
          </div>
        </CardHeader>
        <CardContent>
          {(detail.users ?? []).length === 0 ? (
            <div className="text-center text-zinc-400 py-4 text-sm">暂未分配用户</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {detail.users.map(u => (
                <Badge key={u.id} variant="outline">{u.username}({u.nickname})</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分配角色 Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>分配角色</DialogTitle></DialogHeader>
          <div className="rounded-md border max-h-[300px] overflow-y-auto">
            {allRoles.map(role => (
              <div
                key={role.id}
                className={cn('flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-50 border-b last:border-b-0', selectedRoleIds.includes(role.id) && 'bg-blue-50')}
                onClick={() => setSelectedRoleIds(prev => prev.includes(role.id) ? prev.filter(x => x !== role.id) : [...prev, role.id])}
              >
                <div className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', selectedRoleIds.includes(role.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300')}>
                  {selectedRoleIds.includes(role.id) && <Check size={10} />}
                </div>
                <span className="text-sm">{role.name}</span>
                <span className="text-xs text-zinc-400">{role.code}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={saveRoles}>保存</Button>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>取消</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 分配用户 Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>分配用户</DialogTitle></DialogHeader>

          {/* 搜索栏 */}
          <div className="flex gap-2">
            <Input
              placeholder="搜索账号"
              value={dialogUserSearch}
              onChange={e => setDialogUserSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUserSearch()}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={handleUserSearch}>
              <Search size={14} className="mr-1" /> 搜索
            </Button>
            {selectedUserIds.length > 0 && (
              <span className="flex items-center text-xs text-zinc-500">已选 {selectedUserIds.length} 人</span>
            )}
          </div>

          {/* 用户列表 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>账号</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dialogUserLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-400 py-8">加载中...</TableCell>
                  </TableRow>
                ) : dialogUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-400 py-8">暂无数据</TableCell>
                  </TableRow>
                ) : dialogUsers.map(u => (
                  <TableRow
                    key={u.id}
                    className={cn('cursor-pointer', selectedUserIds.includes(u.id) && 'bg-blue-50')}
                    onClick={() => toggleUserId(u.id)}
                  >
                    <TableCell>
                      <div className={cn('flex h-4 w-4 items-center justify-center rounded border', selectedUserIds.includes(u.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300')}>
                        {selectedUserIds.includes(u.id) && <Check size={10} />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell className="text-zinc-500">{u.nickname || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === 1 ? 'default' : 'secondary'}>
                        {u.status === 1 ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>共 {dialogUserTotal} 条</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={dialogUserPage <= 1} onClick={() => handleUserPageChange(dialogUserPage - 1)}>上一页</Button>
              <span className="flex items-center px-2">第 {dialogUserPage} / {dialogUserTotalPages || 1} 页</span>
              <Button variant="outline" size="sm" disabled={dialogUserPage >= dialogUserTotalPages} onClick={() => handleUserPageChange(dialogUserPage + 1)}>下一页</Button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button onClick={saveUsers}>保存</Button>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>取消</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PermGuard>
  )
}
