import type { LoginForm, AuthUser } from '@/types'

export async function login(form: LoginForm): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  const json = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '登录失败')
  }
  return json.data
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch {
    // ignore
  }
}

export async function register(data: { username: string; email: string; password: string }): Promise<void> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '注册失败')
  }
}

export async function activate(token: string): Promise<void> {
  const res = await fetch('/api/auth/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  const json = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '激活失败')
  }
}

export async function resendActivation(email: string): Promise<void> {
  const res = await fetch('/api/auth/resend-activation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const json = await res.json()
  if (json.code !== 0) {
    throw new Error(json.msg || '发送失败')
  }
}
