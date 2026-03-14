'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getMailConfig, saveMailConfig, sendTestMail, getSiteConfig, saveSiteConfig } from '@/services/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PermGuard } from '@/components/common/PermGuard'
import { Mail, Send, Globe } from 'lucide-react'

const siteSchema = z.object({
  domain: z.string().min(1, '请输入站点域名'),
  name: z.string().min(1, '请输入站点名称'),
})

const mailSchema = z.object({
  host: z.string().min(1, '请输入 SMTP 服务器地址'),
  port: z.coerce.number().int().min(1, '请输入端口号'),
  secure: z.string(),
  user: z.string().min(1, '请输入发件人账号'),
  pass: z.string().min(1, '请输入授权码/密码'),
  from: z.string().min(1, '请输入发件人显示名称'),
})

type SiteFormData = z.infer<typeof siteSchema>
type MailFormData = z.infer<typeof mailSchema>

export default function SystemConfigPage() {
  const [loading, setLoading] = useState(true)
  const [siteSaveSuccess, setSiteSaveSuccess] = useState(false)
  const [mailSaveSuccess, setMailSaveSuccess] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const siteForm = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: { domain: '', name: 'SubGate' },
  })

  const mailForm = useForm<MailFormData>({
    resolver: zodResolver(mailSchema),
    defaultValues: { host: '', port: 465, secure: 'true', user: '', pass: '', from: '' },
  })

  useEffect(() => {
    Promise.all([getSiteConfig(), getMailConfig()]).then(([site, mail]) => {
      if (site) {
        siteForm.setValue('domain', site.domain || '')
        siteForm.setValue('name', site.name || 'SubGate')
      }
      if (mail) {
        mailForm.setValue('host', mail.host || '')
        mailForm.setValue('port', mail.port || 465)
        mailForm.setValue('secure', mail.secure ? 'true' : 'false')
        mailForm.setValue('user', mail.user || '')
        mailForm.setValue('pass', mail.pass || '')
        mailForm.setValue('from', mail.from || '')
      }
      setLoading(false)
    })
  }, [siteForm, mailForm])

  const onSiteSave = async (data: SiteFormData) => {
    setSiteSaveSuccess(false)
    await saveSiteConfig({ domain: data.domain, name: data.name })
    setSiteSaveSuccess(true)
    setTimeout(() => setSiteSaveSuccess(false), 2000)
  }

  const onMailSave = async (data: MailFormData) => {
    setMailSaveSuccess(false)
    await saveMailConfig({
      host: data.host,
      port: data.port,
      secure: data.secure === 'true',
      user: data.user,
      pass: data.pass,
      from: data.from,
    })
    setMailSaveSuccess(true)
    setTimeout(() => setMailSaveSuccess(false), 2000)
  }

  const handleTest = async () => {
    if (!testEmail) return
    setTestLoading(true)
    setTestResult(null)
    try {
      await sendTestMail(testEmail)
      setTestResult({ ok: true, msg: '测试邮件发送成功，请检查收件箱' })
    } catch (e) {
      setTestResult({ ok: false, msg: e instanceof Error ? e.message : '发送失败' })
    } finally {
      setTestLoading(false)
    }
  }

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-zinc-400">加载中...</div>
  }

  return (
    <PermGuard code="system:mail">
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-semibold">系统配置</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe size={16} />
            站点配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={siteForm.handleSubmit(onSiteSave)} className="space-y-4">
            <div className="space-y-1">
              <Label>站点域名</Label>
              <Input placeholder="https://yourdomain.com" {...siteForm.register('domain')} />
              <p className="text-xs text-zinc-400">用于生成激活链接等外部链接，需包含协议（https://）</p>
              {siteForm.formState.errors.domain && <p className="text-xs text-red-500">{siteForm.formState.errors.domain.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>站点名称</Label>
              <Input placeholder="SubGate" {...siteForm.register('name')} />
              {siteForm.formState.errors.name && <p className="text-xs text-red-500">{siteForm.formState.errors.name.message}</p>}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={siteForm.formState.isSubmitting}>
                {siteForm.formState.isSubmitting ? '保存中...' : '保存'}
              </Button>
              {siteSaveSuccess && <span className="text-sm text-emerald-600">保存成功</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail size={16} />
            SMTP 邮件配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={mailForm.handleSubmit(onMailSave)} className="space-y-4">
            <div className="space-y-1">
              <Label>SMTP 服务器</Label>
              <Input placeholder="smtp.qq.com" {...mailForm.register('host')} />
              {mailForm.formState.errors.host && <p className="text-xs text-red-500">{mailForm.formState.errors.host.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>端口</Label>
                <Input type="number" placeholder="465" {...mailForm.register('port')} />
                {mailForm.formState.errors.port && <p className="text-xs text-red-500">{mailForm.formState.errors.port.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>加密方式</Label>
                <Select value={mailForm.watch('secure')} onValueChange={v => mailForm.setValue('secure', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">SSL/TLS</SelectItem>
                    <SelectItem value="false">无</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>发件人账号</Label>
              <Input placeholder="noreply@example.com" {...mailForm.register('user')} />
              {mailForm.formState.errors.user && <p className="text-xs text-red-500">{mailForm.formState.errors.user.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>授权码 / 密码</Label>
              <Input type="password" placeholder="SMTP 授权码" {...mailForm.register('pass')} />
              {mailForm.formState.errors.pass && <p className="text-xs text-red-500">{mailForm.formState.errors.pass.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>发件人显示名称</Label>
              <Input placeholder='SubGate <noreply@example.com>' {...mailForm.register('from')} />
              {mailForm.formState.errors.from && <p className="text-xs text-red-500">{mailForm.formState.errors.from.message}</p>}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={mailForm.formState.isSubmitting}>
                {mailForm.formState.isSubmitting ? '保存中...' : '保存配置'}
              </Button>
              {mailSaveSuccess && <span className="text-sm text-emerald-600">保存成功</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send size={16} />
            发送测试邮件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>收件邮箱</Label>
              <Input
                placeholder="test@example.com"
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={handleTest}
              disabled={testLoading || !testEmail}
              variant="outline"
            >
              {testLoading ? '发送中...' : '发送测试邮件'}
            </Button>
            {testResult && (
              <p className={`text-sm ${testResult.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                {testResult.msg}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </PermGuard>
  )
}
