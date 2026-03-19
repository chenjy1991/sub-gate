'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateUser, getUserById } from '@/services/users'
import { getRoles } from '@/services/roles'
import type { Role } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PermGuard } from '@/components/common/PermGuard'
import { ArrowLeft } from 'lucide-react'

const schema = z.object({
  username: z.string().min(2, '用户名至少2个字符').regex(/^[a-zA-Z][a-zA-Z0-9]*$/, '只能英文和数字，且必须英文开头'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().optional(),
  nickname: z.string().min(1, '请输入昵称'),
  status: z.string(),
  roleId: z.string(),
})

type FormData = z.infer<typeof schema>

export default function EditUserPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: '1', roleId: '' },
  })

  useEffect(() => {
    getRoles({ page: 1, size: 100 }).then(res => setRoles(res.list))
  }, [])

  useEffect(() => {
    if (!id || roles.length === 0) return
    getUserById(Number(id)).then(user => {
      setValue('username', user.username)
      setValue('email', user.email)
      setValue('nickname', user.nickname || '')
      setValue('status', String(user.status))
      const codes = user.roleCodes ?? []
      if (codes.length > 0) {
        const role = roles.find(r => r.code === codes[0])
        if (role) setValue('roleId', String(role.id))
      }
      setLoading(false)
    })
  }, [id, setValue, roles])

  const onSubmit = async (data: FormData) => {
    const roleIds = data.roleId ? [Number(data.roleId)] : []
    await updateUser({
      id: Number(id),
      username: data.username,
      email: data.email,
      password: data.password || undefined,
      nickname: data.nickname,
      status: Number(data.status),
      roleIds,
    })
    router.push('/console/users')
  }

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-zinc-400">加载中...</div>
  }

  return (
    <PermGuard code="system:user">
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/console/users')}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-xl font-semibold">编辑用户</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">用户信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>用户名</Label>
              <Input placeholder="英文开头，只能英文和数字" {...register('username')} />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>邮箱</Label>
              <Input placeholder="请输入邮箱" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>密码（留空则不修改）</Label>
              <Input type="password" placeholder="留空则不修改" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>昵称</Label>
              <Input placeholder="请输入昵称" {...register('nickname')} />
              {errors.nickname && <p className="text-xs text-red-500">{errors.nickname.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>角色</Label>
              <Select value={watch('roleId')} onValueChange={v => setValue('roleId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>状态</Label>
              <Select value={watch('status')} onValueChange={v => setValue('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Button type="button" variant="outline" onClick={() => router.push('/console/users')}>
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
