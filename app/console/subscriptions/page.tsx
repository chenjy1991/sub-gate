'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSubscriptions, deleteSubscription } from '@/services/subscriptions'
import type { Subscription } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PermGuard } from '@/components/common/PermGuard'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'

export default function SubscriptionListPage() {
  const router = useRouter()
  const [list, setList] = useState<Subscription[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const pageSize = 10

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await getSubscriptions({ page, size: pageSize })
      setList(res.list)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList() }, [page])

  const handleDelete = async () => {
    if (deleteId === null) return
    await deleteSubscription(deleteId)
    setDeleteId(null)
    fetchList()
  }

  return (
    <PermGuard code="service:subscription">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">订阅管理</h1>
        <Button size="sm" onClick={() => router.push('/console/subscriptions/new')}>
          <Plus size={14} className="mr-1" /> 新增订阅
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订阅名称</TableHead>
              <TableHead>备注</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-400 py-8">加载中...</TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-400 py-8">暂无数据</TableCell>
              </TableRow>
            ) : list.map(sub => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.name}</TableCell>
                <TableCell className="text-zinc-500">{sub.remark || '-'}</TableCell>
                <TableCell>
                  <Badge variant={sub.status === 1 ? 'default' : 'secondary'}>
                    {sub.status === 1 ? '启用' : '禁用'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/console/subscriptions/${sub.id}`)}>
                      <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/console/subscriptions/${sub.id}/edit`)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeleteId(sub.id)}>
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
            <AlertDialogDescription>此操作不可撤销，确定要删除该订阅吗？</AlertDialogDescription>
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
