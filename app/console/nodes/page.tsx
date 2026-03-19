'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getNodes, deleteNode, parseLinks, importNodes, checkNode, generateLink, updateNode } from '@/services/nodes'
import type { EntityId, ParseResult, ProxyNode } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Search, Pencil, Trash2, Upload, X, Wifi, Loader2, Activity, Link, Copy, Check } from 'lucide-react'

const protocolColors: Record<string, string> = {
  vmess: 'bg-blue-100 text-blue-700',
  vless: 'bg-purple-100 text-purple-700',
  trojan: 'bg-orange-100 text-orange-700',
  ss: 'bg-green-100 text-green-700',
  hysteria2: 'bg-pink-100 text-pink-700',
}

export default function NodeListPage() {
  const router = useRouter()
  const [nodes, setNodes] = useState<ProxyNode[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<EntityId | null>(null)

  const [checkStatus, setCheckStatus] = useState<Map<EntityId, { reachable: boolean; latency: number } | 'checking'>>(new Map())
  const [checkingAll, setCheckingAll] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)

  const [linkOpen, setLinkOpen] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [togglingId, setTogglingId] = useState<EntityId | null>(null)

  const pageSize = 10

  const fetchNodes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getNodes({ page, size: pageSize, keyword: search || undefined })
      setNodes(res.list)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { void fetchNodes() }, [fetchNodes])

  const handleSearch = () => {
    setPage(1)
    setSearch(keyword)
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    await deleteNode(deleteId)
    setDeleteId(null)
    fetchNodes()
  }

  const handleCheck = async (nodeId: EntityId) => {
    setCheckStatus(prev => new Map(prev).set(nodeId, 'checking'))
    try {
      const result = await checkNode(nodeId)
      setCheckStatus(prev => new Map(prev).set(nodeId, result))
    } catch {
      setCheckStatus(prev => new Map(prev).set(nodeId, { reachable: false, latency: -1 }))
    }
  }

  const handleCheckAll = async () => {
    setCheckingAll(true)
    for (const node of nodes) {
      setCheckStatus(prev => new Map(prev).set(node.id, 'checking'))
      try {
        const result = await checkNode(node.id)
        setCheckStatus(prev => new Map(prev).set(node.id, result))
      } catch {
        setCheckStatus(prev => new Map(prev).set(node.id, { reachable: false, latency: -1 }))
      }
    }
    setCheckingAll(false)
  }

  const handleParse = async () => {
    if (!importText.trim()) return
    setParsing(true)
    try {
      const result = await parseLinks(importText)
      setParseResult(result)
    } finally {
      setParsing(false)
    }
  }

  const removeParseItem = (index: number) => {
    if (!parseResult) return
    setParseResult({
      ...parseResult,
      success: parseResult.success.filter((_, i) => i !== index),
    })
  }

  const handleImport = async () => {
    if (!parseResult || parseResult.success.length === 0) return
    setImporting(true)
    try {
      await importNodes(parseResult.success)
      setImportOpen(false)
      setImportText('')
      setParseResult(null)
      fetchNodes()
    } finally {
      setImporting(false)
    }
  }

  const closeImport = () => {
    setImportOpen(false)
    setImportText('')
    setParseResult(null)
  }

  const handleGenerateLink = async (nodeId: EntityId) => {
    setLinkLoading(true)
    setLinkText('')
    setCopied(false)
    setLinkOpen(true)
    try {
      const link = await generateLink(nodeId)
      setLinkText(link)
    } catch {
      setLinkText('获取链接失败')
    } finally {
      setLinkLoading(false)
    }
  }

  const handleToggleStatus = async (id: EntityId, currentStatus: number) => {
    setTogglingId(id)
    try {
      await updateNode({ id, status: currentStatus === 1 ? 0 : 1 })
      fetchNodes()
    } finally {
      setTogglingId(null)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(linkText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PermGuard code="service:node">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">节点配置</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCheckAll} disabled={checkingAll || nodes.length === 0}>
            <Activity size={14} className="mr-1" /> {checkingAll ? '检测中...' : '全部检测'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
            <Upload size={14} className="mr-1" /> 批量导入
          </Button>
          <Button size="sm" onClick={() => router.push('/console/nodes/new')}>
            <Plus size={14} className="mr-1" /> 新增节点
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="搜索节点名称或地址"
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
              <TableHead>名称</TableHead>
              <TableHead>地址</TableHead>
              <TableHead>协议</TableHead>
              <TableHead>传输</TableHead>
              <TableHead>TLS</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>可用性</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-zinc-400 py-8">加载中...</TableCell>
              </TableRow>
            ) : nodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-zinc-400 py-8">暂无数据</TableCell>
              </TableRow>
            ) : nodes.map(node => (
              <TableRow key={node.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{node.name}</TableCell>
                <TableCell className="text-zinc-500">{node.address}:{node.port}</TableCell>
                <TableCell>
                  <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${protocolColors[node.protocol] ?? 'bg-zinc-100 text-zinc-700'}`}>
                    {node.protocol}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-500">{node.network || '-'}</TableCell>
                <TableCell>
                  <Badge variant={node.tls === 1 ? 'default' : 'secondary'}>
                    {node.tls === 1 ? '是' : '否'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={node.status === 1}
                    disabled={togglingId === node.id}
                    onCheckedChange={() => handleToggleStatus(node.id, node.status)}
                  />
                </TableCell>
                <TableCell>
                  {(() => {
                    const status = checkStatus.get(node.id)
                    if (!status) return <span className="text-zinc-300 text-xs">-</span>
                    if (status === 'checking') return <Loader2 size={14} className="animate-spin text-zinc-400" />
                    if (status.reachable) return <span className="text-green-600 text-xs font-medium">可用</span>
                    return <span className="text-red-500 text-xs font-medium">不可用</span>
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleGenerateLink(node.id)} title="获取链接">
                      <Link size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleCheck(node.id)} disabled={checkStatus.get(node.id) === 'checking'}>
                      {checkStatus.get(node.id) === 'checking' ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/console/nodes/${node.id}/edit`)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeleteId(node.id)}>
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
            <AlertDialogDescription>此操作不可撤销，确定要删除该节点吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={importOpen} onOpenChange={open => !open && closeImport()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>批量导入节点</DialogTitle>
          </DialogHeader>

          {!parseResult ? (
            <div className="space-y-4">
              <Textarea
                placeholder="每行一条链接，支持 vmess:// vless:// trojan:// ss:// hysteria2://"
                rows={8}
                value={importText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportText(e.target.value)}
              />
              <Button onClick={handleParse} disabled={parsing || !importText.trim()}>
                {parsing ? '解析中...' : '解析'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm">
                成功解析 <span className="font-medium text-green-600">{parseResult.success.length}</span> 条
                {parseResult.failed.length > 0 && (
                  <>，失败 <span className="font-medium text-red-600">{parseResult.failed.length}</span> 条</>
                )}
              </div>

              {parseResult.success.length > 0 && (
                <div className="rounded-md border max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>名称</TableHead>
                        <TableHead>地址</TableHead>
                        <TableHead>协议</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parseResult.success.map((node, i) => (
                        <TableRow key={i}>
                          <TableCell className="max-w-[150px] truncate">{node.name}</TableCell>
                          <TableCell className="text-zinc-500">{node.address}:{node.port}</TableCell>
                          <TableCell>
                            <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${protocolColors[node.protocol] ?? 'bg-zinc-100 text-zinc-700'}`}>
                              {node.protocol}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-500" onClick={() => removeParseItem(i)}>
                              <X size={12} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {parseResult.failed.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-red-600">解析失败：</p>
                  {parseResult.failed.map((f, i) => (
                    <div key={i} className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                      第 {f.line} 行：{f.error}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleImport} disabled={importing || parseResult.success.length === 0}>
                  {importing ? '导入中...' : `确认导入 (${parseResult.success.length} 条)`}
                </Button>
                <Button variant="outline" onClick={() => setParseResult(null)}>重新输入</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>节点链接</DialogTitle>
          </DialogHeader>
          {linkLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-md bg-zinc-50 p-3 text-xs font-mono break-all select-all">{linkText}</div>
              <Button size="sm" onClick={handleCopyLink} disabled={!linkText || linkText === '获取链接失败'}>
                {copied ? <><Check size={14} className="mr-1" /> 已复制</> : <><Copy size={14} className="mr-1" /> 复制链接</>}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </PermGuard>
  )
}
