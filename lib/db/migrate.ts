import path from 'path'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './index'

const migrationsFolder = path.resolve(process.cwd(), 'drizzle')

export function runMigrations() {
  migrate(db, { migrationsFolder })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
  console.log('数据库迁移完成')
}
