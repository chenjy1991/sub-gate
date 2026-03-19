'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateNode, getNodeById, parseLinks } from '@/services/nodes'
import type { ProxyNode } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { PermGuard } from '@/components/common/PermGuard'
import { ArrowLeft, Upload } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, '请输入节点名称'),
  address: z.string().min(1, '请输入地址'),
  port: z.coerce.number().min(1, '请输入有效端口').max(65535),
  protocol: z.string().min(1, '请选择协议'),
  uuid: z.string().optional(),
  alterId: z.coerce.number().optional(),
  security: z.string().optional(),
  network: z.string().optional(),
  tls: z.string(),
  sni: z.string().optional(),
  path: z.string().optional(),
  host: z.string().optional(),
  remark: z.string().optional(),
  status: z.string(),
})

type FormData = z.infer<typeof schema>

export default function EditNodePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [nodeData, setNodeData] = useState<ProxyNode | null>(null)

  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [importParsing, setImportParsing] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tls: '0', status: '1', protocol: 'vmess', network: 'tcp' },
  })

  const fillForm = useCallback((node: Partial<ProxyNode>) => {
    if (node.name != null) setValue('name', node.name)
    if (node.address != null) setValue('address', node.address)
    if (node.port != null) setValue('port', node.port)
    if (node.protocol) setValue('protocol', node.protocol)
    if (node.uuid != null) setValue('uuid', node.uuid || '')
    if (node.alterId != null) setValue('alterId', node.alterId)
    if (node.security != null) setValue('security', node.security || '')
    if (node.network) setValue('network', node.network)
    if (node.tls != null) setValue('tls', String(node.tls))
    if (node.sni != null) setValue('sni', node.sni || '')
    if (node.path != null) setValue('path', node.path || '')
    if (node.host != null) setValue('host', node.host || '')
    if (node.remark != null) setValue('remark', node.remark || '')
    if (node.status != null) setValue('status', String(node.status))
  }, [setValue])

  useEffect(() => {
    if (!id) return
    getNodeById(Number(id)).then(node => {
      setNodeData(node)
      fillForm(node)
      setLoading(false)
    })
  }, [id, fillForm])

  const onSubmit = async (data: FormData) => {
    if (!nodeData) return
    await updateNode({
      id: nodeData.id,
      name: data.name,
      address: data.address,
      port: data.port,
      protocol: data.protocol,
      uuid: data.uuid || '',
      alterId: data.alterId || 0,
      security: data.security || '',
      network: data.network || 'tcp',
      tls: Number(data.tls),
      sni: data.sni || '',
      path: data.path || '',
      host: data.host || '',
      rawLink: nodeData.rawLink || '',
      remark: data.remark || '',
      status: Number(data.status),
      sort: nodeData.sort || 0,
    })
    router.push('/console/nodes')
  }

  const handleImportParse = async () => {
    const text = importText.trim()
    if (!text) return
    setImportError('')
    setImportParsing(true)
    try {
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length > 1) {
        setImportError('编辑模式仅支持导入单条链接')
        return
      }
      const result = await parseLinks(text)
      if (result.failed.length > 0 && result.success.length === 0) {
        setImportError(result.failed[0].error)
        return
      }
      if (result.success.length > 0) {
        fillForm(result.success[0] as Partial<ProxyNode>)
        setImportOpen(false)
        setImportText('')
      }
    } finally {
      setImportParsing(false)
    }
  }

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-zinc-400">加载中...</div>
  }

  return (
    <PermGuard code="service:node">
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/console/nodes')}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-xl font-semibold">编辑节点</h1>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => { setImportOpen(true); setImportError('') }}>
          <Upload size={14} className="mr-1" /> 导入链接
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">节点信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>节点名称</Label>
              <Input placeholder="请输入节点名称" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>地址</Label>
                <Input placeholder="IP 或域名" {...register('address')} />
                {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>端口</Label>
                <Input type="number" placeholder="443" {...register('port')} />
                {errors.port && <p className="text-xs text-red-500">{errors.port.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>协议</Label>
                <Select value={watch('protocol')} onValueChange={v => setValue('protocol', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vmess">VMess</SelectItem>
                    <SelectItem value="vless">VLESS</SelectItem>
                    <SelectItem value="trojan">Trojan</SelectItem>
                    <SelectItem value="ss">Shadowsocks</SelectItem>
                    <SelectItem value="hysteria2">Hysteria2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>传输方式</Label>
                <Select value={watch('network') || 'tcp'} onValueChange={v => setValue('network', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="ws">WebSocket</SelectItem>
                    <SelectItem value="grpc">gRPC</SelectItem>
                    <SelectItem value="h2">HTTP/2</SelectItem>
                    <SelectItem value="kcp">mKCP</SelectItem>
                    <SelectItem value="udp">UDP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>UUID / 密码</Label>
              <Input placeholder="UUID 或密码" {...register('uuid')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>alterId</Label>
                <Input type="number" placeholder="0" {...register('alterId')} />
              </div>
              <div className="space-y-1">
                <Label>加密方式</Label>
                <Input placeholder="auto" {...register('security')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>TLS</Label>
                <Select value={watch('tls')} onValueChange={v => setValue('tls', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">启用</SelectItem>
                    <SelectItem value="0">关闭</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>SNI</Label>
                <Input placeholder="TLS SNI" {...register('sni')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>路径</Label>
                <Input placeholder="WebSocket/H2 路径" {...register('path')} />
              </div>
              <div className="space-y-1">
                <Label>伪装域名</Label>
                <Input placeholder="Host" {...register('host')} />
              </div>
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
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/console/nodes')}>
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={importOpen} onOpenChange={open => { if (!open) { setImportOpen(false); setImportText(''); setImportError('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入链接</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="粘贴一条节点链接，如 vmess://xxx"
              rows={4}
              value={importText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportText(e.target.value)}
            />
            {importError && <p className="text-xs text-red-500">{importError}</p>}
            <Button onClick={handleImportParse} disabled={importParsing || !importText.trim()}>
              {importParsing ? '解析中...' : '解析并填充'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </PermGuard>
  )
}
