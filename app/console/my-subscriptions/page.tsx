'use client'

import { useEffect, useState, useCallback } from 'react'
import { getMySubscriptions, getMySubscriptionDetail } from '@/services/mySubscriptions'
import { checkNode } from '@/services/nodes'
import { useAuthStore } from '@/store/authStore'
import type { MySubscription, MySubscriptionDetail, ProxyNode } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { PermGuard } from '@/components/common/PermGuard'
import { cn } from '@/lib/utils'
import { Rss, Copy, Check, Loader2 } from 'lucide-react'

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

export default function MySubscriptionPage() {
  const user = useAuthStore(s => s.user)
  const [subscriptions, setSubscriptions] = useState<MySubscription[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<MySubscriptionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [nodeStatus, setNodeStatus] = useState<Record<string, { checking: boolean; reachable?: boolean; latency?: number }>>({})

  useEffect(() => {
    getMySubscriptions().then(data => {
      setSubscriptions(data)
      if (data.length > 0) {
        setSelectedId(data[0].id)
      }
    }).finally(() => setLoading(false))
  }, [])

  const checkAllNodes = useCallback((nodes: ProxyNode[]) => {
    const initial: Record<string, { checking: boolean }> = {}
    nodes.forEach(n => { initial[n.id] = { checking: true } })
    setNodeStatus(initial)

    nodes.forEach(node => {
      checkNode(node.id)
        .then(res => {
          setNodeStatus(prev => ({ ...prev, [node.id]: { checking: false, reachable: res.reachable, latency: res.latency } }))
        })
        .catch(() => {
          setNodeStatus(prev => ({ ...prev, [node.id]: { checking: false, reachable: false, latency: -1 } }))
        })
    })
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setDetailLoading(true)
    setDetail(null)
    setNodeStatus({})
    getMySubscriptionDetail(selectedId).then(data => {
      setDetail(data)
      if (data.nodes.length > 0) {
        checkAllNodes(data.nodes)
      }
    }).finally(() => setDetailLoading(false))
  }, [selectedId, checkAllNodes])

  const handleCopy = async (subId: string, type: string) => {
    if (!user) return
    const url = getSubscribeUrl(user.id, subId, type)
    await navigator.clipboard.writeText(url)
    const key = `${subId}-${type}`
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-zinc-400">加载中...</div>
  }

  if (subscriptions.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center text-zinc-400 gap-2">
        <Rss size={40} strokeWidth={1} />
        <span className="text-sm">暂无可用订阅</span>
      </div>
    )
  }

  return (
    <PermGuard code="my-subscription">
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* 左侧：订阅列表 */}
      <div className="w-[420px] shrink-0 space-y-3 overflow-y-auto pr-1">
        <h2 className="text-lg font-semibold px-1">我的订阅</h2>
        {subscriptions.map(sub => (
          <Card
            key={sub.id}
            className={cn(
              'cursor-pointer transition-colors',
              selectedId === sub.id ? 'border-blue-500 bg-blue-50/50' : 'hover:border-zinc-300'
            )}
            onClick={() => setSelectedId(sub.id)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{sub.name}</span>
                <Badge variant="outline" className="text-xs">{sub.nodeCount} 个节点</Badge>
              </div>
              {sub.remark && (
                <p className="text-xs text-zinc-500 line-clamp-2">{sub.remark}</p>
              )}
              {/* 订阅链接按钮 */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CLIENT_TYPES.map(({ key, label }) => {
                  const copyKey = `${sub.id}-${key}`
                  const isCopied = copiedKey === copyKey
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      title={isCopied ? '已复制' : `复制 ${label} 订阅链接`}
                      onClick={e => {
                        e.stopPropagation()
                        handleCopy(sub.id, key)
                      }}
                    >
                      {isCopied ? <Check size={12} className="mr-1 text-green-600" /> : <Copy size={12} className="mr-1" />}
                      {label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 右侧：节点列表 */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {!selectedId && (
          <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
            请选择左侧的订阅查看节点
          </div>
        )}
        {selectedId && detailLoading && (
          <div className="flex h-40 items-center justify-center text-zinc-400">
            <Loader2 size={20} className="animate-spin mr-2" />
            加载中...
          </div>
        )}
        {selectedId && !detailLoading && detail && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <h2 className="text-lg font-semibold">{detail.name}</h2>
              <Badge variant="outline" className="text-xs">{detail.nodes.length} 个节点</Badge>
            </div>
            {detail.nodes.length === 0 ? (
              <div className="text-center text-zinc-400 py-12 text-sm">该订阅暂无节点</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>协议</TableHead>
                      <TableHead className="w-[80px]">可用性</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.nodes.map(node => {
                      const status = nodeStatus[node.id]
                      return (
                        <TableRow key={node.id}>
                          <TableCell className="font-medium">{node.name}</TableCell>
                          <TableCell><Badge variant="outline">{node.protocol}</Badge></TableCell>
                          <TableCell>
                            {!status || status.checking ? (
                              <Loader2 size={14} className="animate-spin text-zinc-400" />
                            ) : status.reachable ? (
                              <span className="text-green-600 text-xs font-medium">可用</span>
                            ) : (
                              <span className="text-red-500 text-xs font-medium">不可用</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </PermGuard>
  )
}
