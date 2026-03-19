'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { register as registerApi, type RegisterResult } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const schema = z.object({
  username: z.string().min(2, '用户名至少2个字符').regex(/^[a-zA-Z][a-zA-Z0-9]*$/, '只能英文和数字，且必须英文开头'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符'),
  confirmPassword: z.string().min(1, '请确认密码'),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registerResult, setRegisterResult] = useState<RegisterResult | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const result = await registerApi({
        username: data.username,
        email: data.email,
        password: data.password,
      })
      setRegisterResult(result)
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : '注册失败')
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">注册成功</CardTitle>
            <CardDescription>
              {registerResult?.message || '激活邮件已发送到您的邮箱，请查收并点击激活链接完成注册。'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => router.push('/login')}>
              前往登录
            </Button>
            <p className="text-center text-xs text-zinc-400">
              {registerResult?.activationMailSent
                ? '没有收到邮件？请检查垃圾邮件文件夹'
                : '邮件发送失败时，可稍后在登录页使用“重新发送激活邮件”。'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">SubGate</CardTitle>
          <CardDescription>创建新账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" placeholder="英文开头，只能英文和数字" {...register('username')} />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" placeholder="用于账号激活" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" placeholder="至少6个字符" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input id="confirmPassword" type="password" placeholder="再次输入密码" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '注册中...' : '注册'}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              已有账号？<Link href="/login" className="text-violet-600 hover:underline">去登录</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
