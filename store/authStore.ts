import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types'

interface AuthStore {
  user: AuthUser | null
  setUser: (user: AuthUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
    }),
    { name: 'auth-storage' }
  )
)
