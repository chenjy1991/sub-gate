import type { MailConfig, SiteConfig } from '@/types'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { sysConfig } from './db/schema'

export function getJsonConfig<T>(key: string): T | null {
  const row = db.select().from(sysConfig).where(eq(sysConfig.configKey, key)).get()
  if (!row?.configValue) {
    return null
  }

  try {
    return JSON.parse(row.configValue) as T
  } catch {
    return null
  }
}

export function getSiteDomain(): string {
  const siteConfig = getJsonConfig<SiteConfig>('site')
  return typeof siteConfig?.domain === 'string' ? siteConfig.domain : ''
}

export function getMailConfigValue(): MailConfig | null {
  return getJsonConfig<MailConfig>('mail')
}
