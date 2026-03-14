'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getRoles, createRole, updateRole, deleteRole, getPermissionIds, assignPermissions } from '@/services/roles'
import { getPermissionTree } from '@/services/permissions'
import type { Role, PermissionTreeNode } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, KeyRound, Check, Minus } from 'lucide-react'
import { PermGuard } from '@/components/common/PermGuard'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, '请输入角色名称'),
  code: z.string().min(1, '请输入角色代码'),
  remark: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RoleListPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [permDialogOpen, setPermDialogOpen] = useState(false)
  const [permRoleId, setPermRoleId] = useState<string | null>(null)
  const [allPermissions, setAllPermissions] = useState<PermissionTreeNode[]>([])
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([])

  const pageSize = 10

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const res = await getRoles({ page, size: pageSize })
      setRoles(res.list)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRoles() }, [page])

  const openCreate = () => {
    setEditingRole(null)
    reset({ name: '', code: '', remark: '' })
    setDialogOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditingRole(role)
    reset({ name: role.name, code: role.code, remark: role.remark || '' })
    setDialogOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    if (editingRole) {
      await updateRole({ ...editingRole, ...data, remark: data.remark || '' })
    } else {
      await createRole({ name: data.name, code: data.code, remark: data.remark || '', status: 1 })
    }
    setDialogOpen(false)
    fetchRoles()
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    await deleteRole(deleteId)
    setDeleteId(null)
    fetchRoles()
  }

  const openPermDialog = async (roleId: string) => {
    setPermRoleId(roleId)
    const [perms, ids] = await Promise.all([
      getPermissionTree(),
      getPermissionIds(roleId),
    ])
    setAllPermissions(perms)
    setSelectedPermIds(ids)
    setPermDialogOpen(true)
  }

  const savePermissions = async () => {
    if (!permRoleId) return
    await assignPermissions(permRoleId, selectedPermIds)
    setPermDialogOpen(false)
  }

  const getAllDescendantIds = (node: PermissionTreeNode): string[] => {
    const ids: string[] = []
    for (const child of node.children) {
      ids.push(child.id)
      ids.push(...getAllDescendantIds(child))
    }
    return ids
  }

  const getCheckState = (node: PermissionTreeNode, selectedIds: string[]): 'checked' | 'indeterminate' | 'unchecked' => {
    if (node.children.length === 0) {
      return selectedIds.includes(node.id) ? 'checked' : 'unchecked'
    }
    const childStates = node.children.map(c => getCheckState(c, selectedIds))
    if (childStates.every(s => s === 'checked')) return 'checked'
    if (childStates.every(s => s === 'unchecked')) return 'unchecked'
    return 'indeterminate'
  }

  const toggleNode = (node: PermissionTreeNode) => {
    const state = getCheckState(node, selectedPermIds)
    const selfAndDescendants = [node.id, ...getAllDescendantIds(node)]
    if (state === 'checked') {
      setSelectedPermIds(prev => prev.filter(id => !selfAndDescendants.includes(id)))
    } else {
      setSelectedPermIds(prev => [...new Set([...prev, ...selfAndDescendants])])
    }
  }

  const renderTreeNode = (node: PermissionTreeNode, depth: number) => {
    const state = getCheckState(node, selectedPermIds)
    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-zinc-50 rounded"
          style={{ paddingLeft: `${depth * 24 + 8}px` }}
          onClick={() => toggleNode(node)}
        >
          <div className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
            state === 'checked' ? 'bg-blue-600 border-blue-600 text-white' :
            state === 'indeterminate' ? 'bg-blue-600 border-blue-600 text-white' :
            'border-zinc-300'
          )}>
            {state === 'checked' && <Check size={10} />}
            {state === 'indeterminate' && <Minus size={10} />}
          </div>
          <span className="text-sm">{node.name}</span>
          {node.code && (
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs text-zinc-500">{node.code}</code>
          )}
        </div>
        {node.children.map(child => renderTreeNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <PermGuard code="system:role">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">角色管理</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} className="mr-1" /> 新增角色
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>角色名称</TableHead>
              <TableHead>角色代码</TableHead>
              <TableHead>备注</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-400 py-8">加载中...</TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-400 py-8">暂无数据</TableCell>
              </TableRow>
            ) : roles.map(role => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">{role.code}</code>
                </TableCell>
                <TableCell className="text-zinc-500">{role.remark}</TableCell>
                <TableCell>
                  <Badge variant={role.status === 1 ? 'default' : 'secondary'}>
                    {role.status === 1 ? '启用' : '禁用'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="分配权限" onClick={() => openPermDialog(role.id)}>
                      <KeyRound size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(role)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeleteId(role.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? '编辑角色' : '新增角色'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>角色名称</Label>
              <Input placeholder="如：管理员" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>角色代码</Label>
              <Input placeholder="如：ADMIN" {...register('code')} />
              {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>备注</Label>
              <Input placeholder="角色描述（可选）" {...register('remark')} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销，确定要删除该角色吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>分配权限</DialogTitle></DialogHeader>
          <div className="rounded-md border max-h-[400px] overflow-y-auto p-2">
            {allPermissions.map(node => renderTreeNode(node, 0))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={savePermissions}>保存</Button>
            <Button variant="outline" onClick={() => setPermDialogOpen(false)}>取消</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PermGuard>
  )
}
