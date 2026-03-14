'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { login } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const schema = z.object({
  username: z.string().min(1, '请输入账号'),
  password: z.string().min(1, '请输入密码'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      router.push('/console')
    }
  }, [user, router])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await login(data)
      useAuthStore.getState().setUser(res.user)
      router.push('/console')
    } catch (e) {
      setError(e instanceof Error ? e.message : '登录失败')
    }
  }

  if (user) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">SubGate</CardTitle>
          <CardDescription>请输入账号密码登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username">账号</Label>
              <Input id="username" placeholder="用户名 / 邮箱" {...register('username')} />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" placeholder="••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '登录中...' : '登录'}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              没有账号？<a href="/register" className="text-violet-600 hover:underline">去注册</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
