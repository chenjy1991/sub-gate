'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUsers, deleteUser } from '@/services/users'
import type { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PermGuard } from '@/components/common/PermGuard'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'

const roleLabels: Record<string, string> = { ADMIN: '管理员', VIP: 'VIP用户', USER: '注册用户' }

export default function UserListPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const pageSize = 10

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await getUsers({ page, size: pageSize, username: search || undefined })
      setUsers(res.list)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page, search])

  const handleSearch = () => {
    setPage(1)
    setSearch(keyword)
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    await deleteUser(deleteId)
    setDeleteId(null)
    fetchUsers()
  }

  return (
    <PermGuard code="system:user">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">用户管理</h1>
        <Button size="sm" onClick={() => router.push('/console/users/new')}>
          <Plus size={14} className="mr-1" /> 新增用户
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="搜索用户名"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={handleSearch}>
          <Search size={14} className="mr-1" /> 搜索
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>昵称</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-zinc-400 py-8">加载中...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-zinc-400 py-8">暂无数据</TableCell>
              </TableRow>
            ) : users.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell className="text-zinc-500">{user.email}</TableCell>
                <TableCell>{user.nickname}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(user.roleCodes ?? []).map(code => (
                      <Badge key={code} variant="outline">{roleLabels[code] ?? code}</Badge>
                    ))}
                    {(!user.roleCodes || user.roleCodes.length === 0) && <span className="text-zinc-400 text-xs">无角色</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 1 ? 'default' : 'secondary'}>
                    {user.status === 1 ? '启用' : '禁用'}
                  </Badge>
                </TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/console/users/${user.id}/edit`)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeleteId(user.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>共 {total} 条</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
          <span className="flex items-center px-2">第 {page} 页</span>
          <Button variant="outline" size="sm" disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}>下一页</Button>
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销，确定要删除该用户吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PermGuard>
  )
}
