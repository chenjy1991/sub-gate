'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasPermission } from '@/lib/permission'
import { useAuthStore } from '@/store/authStore'
import { Zap } from 'lucide-react'

export default function ConsolePage() {
  const router = useRouter()
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    if (user && hasPermission('dashboard')) {
      router.replace('/console/dashboard')
    }
  }, [user, router])

  if (user && hasPermission('dashboard')) {
    return null
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full bg-violet-100 p-4">
          <Zap className="h-8 w-8 text-violet-500" />
        </div>
        <h1 className="text-2xl font-semibold">欢迎使用 SubGate</h1>
        <p className="text-zinc-400 text-sm max-w-xs mx-auto">
          {user?.name ? `你好，${user.name}` : '你好'}。请从左侧菜单选择功能开始使用。
        </p>
      </div>
    </div>
  )
}
