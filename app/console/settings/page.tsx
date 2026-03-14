'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getMe, updateUser, changePassword } from '@/services/users'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const profileSchema = z.object({
  nickname: z.string().min(1, '请输入昵称'),
})

const passwordSchema = z.object({
  oldPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string().min(6, '新密码至少6个字符'),
  confirmPassword: z.string().min(1, '请确认新密码'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdError, setPwdError] = useState('')

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const pwdForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    getMe().then(user => {
      setUsername(user.username)
      setEmail(user.email)
      setUserId(String(user.id))
      profileForm.setValue('nickname', user.nickname || '')
      setLoading(false)
    })
  }, [profileForm])

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileSuccess(false)
    await updateUser({ id: userId, nickname: data.nickname })
    const store = useAuthStore.getState()
    if (store.user) {
      store.setUser({ ...store.user, name: data.nickname })
    }
    setProfileSuccess(true)
    setTimeout(() => setProfileSuccess(false), 2000)
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPwdSuccess(false)
    setPwdError('')
    try {
      await changePassword(data.oldPassword, data.newPassword)
      setPwdSuccess(true)
      pwdForm.reset()
      setTimeout(() => setPwdSuccess(false), 2000)
    } catch (e) {
      setPwdError(e instanceof Error ? e.message : '修改失败')
    }
  }

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-zinc-400">加载中...</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-semibold">个人设置</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">账号信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>用户名</Label>
                <Input value={username} disabled className="bg-zinc-50" />
                <p className="text-xs text-zinc-400">用户名不可自行修改，如需修改请联系管理员</p>
              </div>
              <div className="space-y-1">
                <Label>邮箱</Label>
                <Input value={email} disabled className="bg-zinc-50" />
                <p className="text-xs text-zinc-400">邮箱不可自行修改，如需修改请联系管理员</p>
              </div>
              <div className="space-y-1">
                <Label>昵称</Label>
                <Input placeholder="请输入昵称" {...profileForm.register('nickname')} />
                {profileForm.formState.errors.nickname && <p className="text-xs text-red-500">{profileForm.formState.errors.nickname.message}</p>}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting ? '保存中...' : '保存'}
                </Button>
                {profileSuccess && <span className="text-sm text-emerald-600">保存成功</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">修改密码</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={pwdForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>当前密码</Label>
                <Input type="password" placeholder="请输入当前密码" {...pwdForm.register('oldPassword')} />
                {pwdForm.formState.errors.oldPassword && <p className="text-xs text-red-500">{pwdForm.formState.errors.oldPassword.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>新密码</Label>
                <Input type="password" placeholder="至少6个字符" {...pwdForm.register('newPassword')} />
                {pwdForm.formState.errors.newPassword && <p className="text-xs text-red-500">{pwdForm.formState.errors.newPassword.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>确认新密码</Label>
                <Input type="password" placeholder="再次输入新密码" {...pwdForm.register('confirmPassword')} />
                {pwdForm.formState.errors.confirmPassword && <p className="text-xs text-red-500">{pwdForm.formState.errors.confirmPassword.message}</p>}
              </div>
              {pwdError && <p className="text-sm text-red-500">{pwdError}</p>}
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={pwdForm.formState.isSubmitting}>
                  {pwdForm.formState.isSubmitting ? '修改中...' : '修改密码'}
                </Button>
                {pwdSuccess && <span className="text-sm text-emerald-600">密码修改成功</span>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
