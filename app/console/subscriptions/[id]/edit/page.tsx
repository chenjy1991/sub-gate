'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getSubscriptionById, updateSubscription } from '@/services/subscriptions'
import { getNodes } from '@/services/nodes'
import type { ProxyNode } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Check } from 'lucide-react'
import { PermGuard } from '@/components/common/PermGuard'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, '请输入订阅名称'),
  remark: z.string().optional(),
  status: z.string(),
})

type FormData = z.infer<typeof schema>

export default function SubscriptionEditPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [allNodes, setAllNodes] = useState<ProxyNode[]>([])
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([])

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: '1' },
  })

  useEffect(() => {
    getNodes({ page: 1, size: 1000 }).then(res => setAllNodes(res.list))
  }, [])

  useEffect(() => {
    if (!id) return
    getSubscriptionById(id).then(data => {
      setValue('name', data.name)
      setValue('remark', data.remark || '')
      setValue('status', String(data.status))
      setSelectedNodeIds(data.nodeIds ?? [])
      setLoading(false)
    })
  }, [id, setValue])

  const toggleNode = (nodeId: string) => {
    setSelectedNodeIds(prev =>
      prev.includes(nodeId) ? prev.filter(nid => nid !== nodeId) : [...prev, nodeId]
    )
  }

  const onSubmit = async (data: FormData) => {
    await updateSubscription({
      id,
      name: data.name,
      remark: data.remark || '',
      status: Number(data.status),
      nodeIds: selectedNodeIds,
    })
    router.push(`/console/subscriptions/${id}`)
  }

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-zinc-400">加载中...</div>
  }

  return (
    <PermGuard code="service:subscription">
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/console/subscriptions/${id}`)}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-xl font-semibold">编辑订阅</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>订阅名称</Label>
              <Input placeholder="请输入订阅名称" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>备注</Label>
              <Input placeholder="备注（可选）" {...register('remark')} />
            </div>
            <div className="space-y-1">
              <Label>状态</Label>
              <Select value={watch('status')} onValueChange={v => setValue('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">启用</SelectItem>
                  <SelectItem value="0">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>关联节点（已选 {selectedNodeIds.length} 个）</Label>
              <div className="rounded-md border max-h-[300px] overflow-y-auto">
                {allNodes.length === 0 ? (
                  <div className="text-center text-zinc-400 py-4 text-sm">暂无可用节点</div>
                ) : allNodes.map(node => (
                  <div
                    key={node.id}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-50 border-b last:border-b-0',
                      selectedNodeIds.includes(node.id) && 'bg-blue-50'
                    )}
                    onClick={() => toggleNode(node.id)}
                  >
                    <div className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                      selectedNodeIds.includes(node.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300'
                    )}>
                      {selectedNodeIds.includes(node.id) && <Check size={10} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{node.name}</span>
                      <span className="text-xs text-zinc-400 ml-2">{node.address}:{node.port}</span>
                    </div>
                    <span className="text-xs text-zinc-400">{node.protocol}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/console/subscriptions/${id}`)}>
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </PermGuard>
  )
}
