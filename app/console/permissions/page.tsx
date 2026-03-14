'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getPermissionTree, createPermission, updatePermission, deletePermission } from '@/services/permissions'
import type { PermissionTreeNode } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { PermGuard } from '@/components/common/PermGuard'
import { cn } from '@/lib/utils'
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react'

const menuSchema = z.object({
  name: z.string().min(1, '请输入名称'),
  code: z.string().min(1, '请输入权限码'),
  sort: z.coerce.number().int().min(0, '排序值不能为负数'),
  remark: z.string().optional(),
})

const buttonSchema = z.object({
  name: z.string().min(1, '请输入名称'),
  code: z.string().min(1, '请输入权限码'),
  remark: z.string().optional(),
})

type MenuFormData = z.infer<typeof menuSchema>
type ButtonFormData = z.infer<typeof buttonSchema>

type DialogMode =
  | { type: 'create-menu'; parentId: string }
  | { type: 'create-button'; parentId: string }
  | { type: 'edit'; node: PermissionTreeNode }

export default function PermissionListPage() {
  const [tree, setTree] = useState<PermissionTreeNode[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PermissionTreeNode | null>(null)

  const isMenuDialog = dialogMode
    ? dialogMode.type === 'create-menu' || (dialogMode.type === 'edit' && dialogMode.node.type === 'menu')
    : false

  const menuForm = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
  })

  const buttonForm = useForm<ButtonFormData>({
    resolver: zodResolver(buttonSchema),
  })

  const fetchTree = async () => {
    const data = await getPermissionTree()
    // API 返回的 id/parentId 是 number，统一转为 string
    const normalize = (nodes: PermissionTreeNode[]): PermissionTreeNode[] =>
      nodes.map(n => ({
        ...n,
        id: String(n.id),
        parentId: String(n.parentId),
        children: normalize(n.children),
      }))
    const normalized = normalize(data)
    setTree(normalized)
    setExpanded(prev => {
      const next = new Set(prev)
      normalized.forEach(n => next.add(n.id))
      return next
    })
  }

  useEffect(() => { fetchTree() }, [])

  const findNode = (id: string): { node: PermissionTreeNode; level: 1 | 2 } | null => {
    for (const l1 of tree) {
      if (l1.id === id) return { node: l1, level: 1 }
      for (const l2 of l1.children) {
        if (l2.id === id) return { node: l2, level: 2 }
      }
    }
    return null
  }

  const selected = selectedId ? findNode(selectedId) : null

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openCreateMenu = (parentId: string) => {
    setDialogMode({ type: 'create-menu', parentId })
    menuForm.reset({ name: '', code: '', sort: 0, remark: '' })
  }

  const openCreateButton = (parentId: string) => {
    setDialogMode({ type: 'create-button', parentId })
    buttonForm.reset({ name: '', code: '', remark: '' })
  }

  const openEdit = (node: PermissionTreeNode) => {
    setDialogMode({ type: 'edit', node })
    if (node.type === 'menu') {
      menuForm.reset({ name: node.name, code: node.code, sort: node.sort, remark: node.remark || '' })
    } else {
      buttonForm.reset({ name: node.name, code: node.code, remark: node.remark || '' })
    }
  }

  const onSubmitMenu = async (data: MenuFormData) => {
    if (!dialogMode) return
    if (dialogMode.type === 'edit') {
      await updatePermission({
        ...dialogMode.node,
        ...data,
        remark: data.remark || '',
      })
    } else {
      await createPermission({
        parentId: dialogMode.parentId,
        name: data.name,
        code: data.code,
        type: 'menu',
        sort: data.sort,
        remark: data.remark || '',
      })
    }
    setDialogMode(null)
    fetchTree()
  }

  const onSubmitButton = async (data: ButtonFormData) => {
    if (!dialogMode) return
    if (dialogMode.type === 'edit') {
      await updatePermission({
        ...dialogMode.node,
        ...data,
        remark: data.remark || '',
      })
    } else {
      await createPermission({
        parentId: (dialogMode as { type: 'create-button'; parentId: string }).parentId,
        name: data.name,
        code: data.code,
        type: 'button',
        sort: 0,
        remark: data.remark || '',
      })
    }
    setDialogMode(null)
    fetchTree()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deletePermission(deleteTarget.id)
    setDeleteTarget(null)
    if (selectedId === deleteTarget.id) setSelectedId(null)
    fetchTree()
  }

  const renderRightPanel = () => {
    if (!selected) {
      return (
        <div className="flex h-full items-center justify-center text-zinc-400">
          请选择左侧菜单
        </div>
      )
    }

    const { node, level } = selected

    if (level === 1) {
      const children = node.children.filter(c => c.type === 'menu')
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-base font-medium">{node.name} - 子菜单</h2>
            <Button size="sm" onClick={() => openCreateMenu(node.id)}>
              <Plus size={14} className="mr-1" /> 新增子菜单
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>权限码</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-400 py-8">暂无子菜单</TableCell>
                  </TableRow>
                ) : children.map(child => (
                  <TableRow key={child.id}>
                    <TableCell className="font-medium">{child.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">{child.code}</code>
                    </TableCell>
                    <TableCell>{child.sort}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(child)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(child)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )
    }

    const buttons = node.children.filter(c => c.type === 'button')
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-medium">{node.name} - 按钮权限</h2>
          <Button size="sm" onClick={() => openCreateButton(node.id)}>
            <Plus size={14} className="mr-1" /> 新增按钮权限
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>权限码</TableHead>
                <TableHead>备注</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buttons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-400 py-8">暂无按钮权限</TableCell>
                </TableRow>
              ) : buttons.map(btn => (
                <TableRow key={btn.id}>
                  <TableCell className="font-medium">{btn.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">{btn.code}</code>
                  </TableCell>
                  <TableCell className="text-zinc-500">{btn.remark || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(btn)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(btn)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const deleteMessage = deleteTarget
    ? deleteTarget.type === 'menu'
      ? '删除菜单将同时删除其下所有子菜单和按钮权限'
      : '确定要删除该权限吗？'
    : ''

  return (
    <PermGuard code="system:permission">
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* 左侧面板 - 权限菜单树 */}
      <div className="w-[280px] shrink-0 rounded-md border bg-white flex flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-medium">权限菜单</h2>
          <Button size="sm" variant="outline" onClick={() => openCreateMenu('0')}>
            <Plus size={14} className="mr-1" /> 新增
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-1">
          {tree.filter(n => n.type === 'menu').map(l1 => {
            const isExpanded = expanded.has(l1.id)
            const subMenus = l1.children.filter(c => c.type === 'menu')
            return (
              <div key={l1.id}>
                <div
                  className={cn(
                    'group flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-zinc-100 rounded-sm mx-1',
                    selectedId === l1.id && 'bg-zinc-100 font-medium'
                  )}
                  onClick={() => setSelectedId(l1.id)}
                >
                  <button
                    className="shrink-0 p-0.5 hover:bg-zinc-200 rounded"
                    onClick={e => { e.stopPropagation(); toggleExpand(l1.id) }}
                  >
                    {isExpanded
                      ? <ChevronDown size={14} className="text-zinc-500" />
                      : <ChevronRight size={14} className="text-zinc-500" />
                    }
                  </button>
                  <span className="flex-1 truncate text-sm">{l1.name}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                    <button
                      className="p-1 hover:bg-zinc-200 rounded"
                      onClick={e => { e.stopPropagation(); openCreateMenu(l1.id) }}
                      title="新增子菜单"
                    >
                      <Plus size={12} className="text-zinc-500" />
                    </button>
                    <button
                      className="p-1 hover:bg-zinc-200 rounded"
                      onClick={e => { e.stopPropagation(); openEdit(l1) }}
                      title="编辑"
                    >
                      <Pencil size={12} className="text-zinc-500" />
                    </button>
                    <button
                      className="p-1 hover:bg-red-100 rounded"
                      onClick={e => { e.stopPropagation(); setDeleteTarget(l1) }}
                      title="删除"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
                {isExpanded && subMenus.map(l2 => (
                  <div
                    key={l2.id}
                    className={cn(
                      'group flex items-center gap-1 pl-8 pr-2 py-1.5 cursor-pointer hover:bg-zinc-100 rounded-sm mx-1',
                      selectedId === l2.id && 'bg-zinc-100 font-medium'
                    )}
                    onClick={() => setSelectedId(l2.id)}
                  >
                    <span className="flex-1 truncate text-sm">{l2.name}</span>
                    <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                      <button
                        className="p-1 hover:bg-zinc-200 rounded"
                        onClick={e => { e.stopPropagation(); openEdit(l2) }}
                        title="编辑"
                      >
                        <Pencil size={12} className="text-zinc-500" />
                      </button>
                      <button
                        className="p-1 hover:bg-red-100 rounded"
                        onClick={e => { e.stopPropagation(); setDeleteTarget(l2) }}
                        title="删除"
                      >
                        <Trash2 size={12} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* 右侧面板 */}
      <div className="flex-1 rounded-md border bg-white overflow-hidden">
        {renderRightPanel()}
      </div>

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogMode !== null} onOpenChange={open => { if (!open) setDialogMode(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode?.type === 'edit'
                ? (dialogMode.node.type === 'menu' ? '编辑菜单' : '编辑按钮权限')
                : dialogMode?.type === 'create-button'
                  ? '新增按钮权限'
                  : '新增菜单'
              }
            </DialogTitle>
          </DialogHeader>
          {isMenuDialog ? (
            <form onSubmit={menuForm.handleSubmit(onSubmitMenu)} className="space-y-4">
              <div className="space-y-1">
                <Label>名称</Label>
                <Input placeholder="请输入名称" {...menuForm.register('name')} />
                {menuForm.formState.errors.name && (
                  <p className="text-xs text-red-500">{menuForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>权限码</Label>
                <Input placeholder="如：user:list" {...menuForm.register('code')} />
                {menuForm.formState.errors.code && (
                  <p className="text-xs text-red-500">{menuForm.formState.errors.code.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>排序</Label>
                <Input type="number" placeholder="0" {...menuForm.register('sort')} />
                {menuForm.formState.errors.sort && (
                  <p className="text-xs text-red-500">{menuForm.formState.errors.sort.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>备注</Label>
                <Input placeholder="备注（可选）" {...menuForm.register('remark')} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={menuForm.formState.isSubmitting}>
                  {menuForm.formState.isSubmitting ? '保存中...' : '保存'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogMode(null)}>取消</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={buttonForm.handleSubmit(onSubmitButton)} className="space-y-4">
              <div className="space-y-1">
                <Label>名称</Label>
                <Input placeholder="请输入名称" {...buttonForm.register('name')} />
                {buttonForm.formState.errors.name && (
                  <p className="text-xs text-red-500">{buttonForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>权限码</Label>
                <Input placeholder="如：user:create" {...buttonForm.register('code')} />
                {buttonForm.formState.errors.code && (
                  <p className="text-xs text-red-500">{buttonForm.formState.errors.code.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>备注</Label>
                <Input placeholder="备注（可选）" {...buttonForm.register('remark')} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={buttonForm.formState.isSubmitting}>
                  {buttonForm.formState.isSubmitting ? '保存中...' : '保存'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogMode(null)}>取消</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>{deleteMessage}</AlertDialogDescription>
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
