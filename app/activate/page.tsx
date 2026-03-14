'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { activate } from '@/services/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function ActivateContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('缺少激活 token')
      return
    }
    activate(token)
      .then(() => setStatus('success'))
      .catch(e => {
        setStatus('error')
        setError(e instanceof Error ? e.message : '激活失败')
      })
  }, [token])

  return (
    <>
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">正在激活账号...</p>
        </div>
      )}
      {status === 'success' && (
        <div className="flex flex-col items-center gap-3 py-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="text-base font-medium">激活成功</p>
          <p className="text-sm text-zinc-500">您的账号已激活，现在可以登录了</p>
          <Link href="/login">
            <Button className="mt-2">前往登录</Button>
          </Link>
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 py-4">
          <XCircle className="h-10 w-10 text-red-500" />
          <p className="text-base font-medium">激活失败</p>
          <p className="text-sm text-red-500 text-center">{error}</p>
          <Link href="/login">
            <Button variant="outline" className="mt-2">返回登录</Button>
          </Link>
        </div>
      )}
    </>
  )
}

export default function ActivatePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">SubGate</CardTitle>
          <CardDescription>账号激活</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-500">加载中...</p>
            </div>
          }>
            <ActivateContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
