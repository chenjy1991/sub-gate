import { useAuthStore } from '@/store/authStore'

export function hasPermission(code: string): boolean {
  const user = useAuthStore.getState().user
  if (!user) return false
  if (user.permissions.includes('*')) return true
  return user.permissions.includes(code)
}
