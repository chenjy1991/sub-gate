import { useAuthStore } from '@/store/authStore'

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  let res: Response
  try {
    res = await fetch(url, { ...options, headers })
  } catch {
    throw new Error('网络连接失败，请检查网络')
  }

  if (res.status === 401) {
    useAuthStore.getState().clearAuth()
    window.location.href = '/login'
    throw new Error('未登录或登录已过期')
  }

  if (!res.ok) {
    throw new Error(`请求失败 (${res.status})`)
  }

  const json = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '操作失败')
  }
  return json.data
}
