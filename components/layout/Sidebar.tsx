'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'
import { hasPermission } from '@/lib/permission'
import {
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  Globe,
  Rss,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  Briefcase,
  Zap,
  UserCog,
  Mail,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavLeaf {
  type: 'leaf'
  to: string
  icon: LucideIcon
  label: string
  permission?: string
}

interface NavGroup {
  type: 'group'
  icon: LucideIcon
  label: string
  permission?: string
  children: NavLeaf[]
}

type NavItem = NavLeaf | NavGroup

const navTree: NavItem[] = [
  { type: 'leaf', to: '/console/dashboard', icon: LayoutDashboard, label: '数据看板', permission: 'dashboard' },
  { type: 'leaf', to: '/console/my-subscriptions', icon: Star, label: '我的订阅', permission: 'my-subscription' },
  {
    type: 'group',
    icon: Briefcase,
    label: '业务管理',
    children: [
      { type: 'leaf', to: '/console/nodes', icon: Globe, label: '节点管理', permission: 'service:node' },
      { type: 'leaf', to: '/console/subscriptions', icon: Rss, label: '订阅管理', permission: 'service:subscription' },
    ],
  },
  {
    type: 'group',
    icon: Settings,
    label: '系统管理',
    children: [
      { type: 'leaf', to: '/console/users', icon: Users, label: '用户管理', permission: 'system:user' },
      { type: 'leaf', to: '/console/roles', icon: Shield, label: '角色管理', permission: 'system:role' },
      { type: 'leaf', to: '/console/permissions', icon: KeyRound, label: '权限管理', permission: 'system:permission' },
      { type: 'leaf', to: '/console/mail', icon: Mail, label: '系统配置', permission: 'system:mail' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['系统管理', '业务管理']))

  const toggleGroup = (label: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const isLeafVisible = (item: NavLeaf) => !item.permission || hasPermission(item.permission)

  const isGroupVisible = (group: NavGroup) => {
    if (group.permission && !hasPermission(group.permission)) return false
    return group.children.some(isLeafVisible)
  }

  const renderLeaf = (item: NavLeaf) => {
    if (!isLeafVisible(item)) return null
    const isActive = pathname === item.to || pathname.startsWith(item.to + '/')
    return (
      <Link
        key={item.to}
        href={item.to}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-zinc-700 text-white'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        )}
      >
        <item.icon size={18} className="shrink-0" />
        {!sidebarCollapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  const renderGroup = (group: NavGroup) => {
    if (!isGroupVisible(group)) return null
    const isOpen = expanded.has(group.label)
    const hasActiveChild = group.children.some(
      c => pathname === c.to || pathname.startsWith(c.to + '/')
    )

    if (sidebarCollapsed) {
      return (
        <div key={group.label}>
          {group.children.filter(isLeafVisible).map(renderLeaf)}
        </div>
      )
    }

    return (
      <div key={group.label}>
        <button
          onClick={() => toggleGroup(group.label)}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
            hasActiveChild
              ? 'text-white'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          )}
        >
          <group.icon size={18} className="shrink-0" />
          <span className="flex-1 text-left">{group.label}</span>
          <ChevronDown
            size={14}
            className={cn(
              'shrink-0 transition-transform duration-200',
              !isOpen && '-rotate-90'
            )}
          />
        </button>
        {isOpen && (
          <div className="ml-3 border-l border-zinc-700 pl-2 space-y-0.5">
            {group.children.filter(isLeafVisible).map(child => {
              const isActive = pathname === child.to || pathname.startsWith(child.to + '/')
              return (
                <Link
                  key={child.to}
                  href={child.to}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  )}
                >
                  <child.icon size={16} className="shrink-0" />
                  <span>{child.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-zinc-900 text-zinc-100 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-zinc-700 px-4 gap-2">
        <Zap size={18} className="shrink-0 text-violet-400" />
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold tracking-wide truncate">SubGate</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navTree.map(item =>
          item.type === 'leaf' ? renderLeaf(item) : renderGroup(item)
        )}
      </nav>

      {/* 底部：个人设置 */}
      <div className="border-t border-zinc-700 px-2 py-2">
        <Link
          href="/console/settings"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
            pathname === '/console/settings'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          )}
        >
          <UserCog size={18} className="shrink-0" />
          {!sidebarCollapsed && <span>个人设置</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
