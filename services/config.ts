import { request } from '@/lib/request'
import type { MailConfig, SiteConfig } from '@/types'

export function getConfig<T>(key: string): Promise<T | null> {
  return request('/api/config/get', { method: 'POST', body: JSON.stringify({ key }) })
}

export function saveConfig<T>(key: string, value: T, remark?: string): Promise<void> {
  return request('/api/config/save', { method: 'POST', body: JSON.stringify({ key, value, remark }) })
}

export function getMailConfig(): Promise<MailConfig | null> {
  return getConfig<MailConfig>('mail')
}

export function saveMailConfig(config: MailConfig): Promise<void> {
  return saveConfig('mail', config, 'SMTP 邮件配置')
}

export function sendTestMail(to: string): Promise<void> {
  return request('/api/mail/test', { method: 'POST', body: JSON.stringify({ to }) })
}

export function getSiteConfig(): Promise<SiteConfig | null> {
  return getConfig<SiteConfig>('site')
}

export function saveSiteConfig(config: SiteConfig): Promise<void> {
  return saveConfig('site', config, '站点配置')
}
