'use client'

import { useRouter } from 'next/navigation'
import { hasPermission } from '@/lib/permission'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PermGuard({ code, children }: { code: string; children: React.ReactNode }) {
  const router = useRouter()

  if (hasPermission(code)) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center rounded-full bg-red-50 p-4">
          <ShieldX className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold">无访问权限</h2>
        <p className="text-sm text-zinc-400">您没有访问此页面的权限，请联系管理员</p>
        <Button variant="outline" onClick={() => router.push('/console')}>
          返回首页
        </Button>
      </div>
    </div>
  )
}
