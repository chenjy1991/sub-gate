'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { logout } from '@/services/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const user = useAuthStore(s => s.user)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    useAuthStore.getState().clearAuth()
    router.push('/login')
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-zinc-100">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-zinc-800 text-white">
                {user?.name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-zinc-700">{user?.name}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem disabled>
            <User size={14} className="mr-2" />
            {user?.username}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut size={14} className="mr-2" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
