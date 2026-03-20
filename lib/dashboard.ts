import { and, gte, lt, sql } from 'drizzle-orm'
import type { ChartDataPoint, DashboardOverview, DashboardStats } from '@/types'
import { formatDateKey, formatDateTime } from '@/lib/datetime'
import { db } from '@/lib/db'
import { sysLoginLog, sysRole, sysUser } from '@/lib/db/schema'

interface AggregateRow {
  date: string
  value: number
}

function shiftDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function startOfDay(date = new Date()): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function buildTrend(days: number, rows: AggregateRow[]): ChartDataPoint[] {
  const valueByDate = new Map(rows.map(row => [row.date, Number(row.value)]))
  const today = startOfDay()
  const points: ChartDataPoint[] = []

  for (let index = days - 1; index >= 0; index -= 1) {
    const currentDate = shiftDays(today, -index)
    const date = formatDateKey(currentDate)

    points.push({
      date,
      value: valueByDate.get(date) ?? 0,
      label: date.slice(5),
    })
  }

  return points
}

export function getDashboardOverview(days = 7): DashboardOverview {
  const normalizedDays = Math.max(7, Math.min(30, days))
  const today = startOfDay()
  const chartStart = shiftDays(today, -(normalizedDays - 1))
  const tomorrow = shiftDays(today, 1)
  const chartStartAt = formatDateTime(chartStart)
  const todayStartAt = formatDateTime(today)
  const tomorrowStartAt = formatDateTime(tomorrow)

  const [{ totalUsers }] = db
    .select({ totalUsers: sql<number>`count(*)` })
    .from(sysUser)
    .all()

  const [{ totalRoles }] = db
    .select({ totalRoles: sql<number>`count(*)` })
    .from(sysRole)
    .all()

  const [{ activeUsers }] = db
    .select({ activeUsers: sql<number>`count(distinct ${sysLoginLog.userId})` })
    .from(sysLoginLog)
    .where(gte(sysLoginLog.createdAt, chartStartAt))
    .all()

  const [{ todayLogins }] = db
    .select({ todayLogins: sql<number>`count(*)` })
    .from(sysLoginLog)
    .where(and(
      gte(sysLoginLog.createdAt, todayStartAt),
      lt(sysLoginLog.createdAt, tomorrowStartAt)
    ))
    .all()

  const userDateExpression = sql<string>`substr(${sysUser.createdAt}, 1, 10)`
  const loginDateExpression = sql<string>`substr(${sysLoginLog.createdAt}, 1, 10)`

  const userGrowthRows = db
    .select({
      date: userDateExpression,
      value: sql<number>`count(*)`,
    })
    .from(sysUser)
    .where(gte(sysUser.createdAt, chartStartAt))
    .groupBy(userDateExpression)
    .orderBy(userDateExpression)
    .all()

  const loginTrendRows = db
    .select({
      date: loginDateExpression,
      value: sql<number>`count(*)`,
    })
    .from(sysLoginLog)
    .where(gte(sysLoginLog.createdAt, chartStartAt))
    .groupBy(loginDateExpression)
    .orderBy(loginDateExpression)
    .all()

  const stats: DashboardStats = {
    totalUsers: Number(totalUsers ?? 0),
    activeUsers: Number(activeUsers ?? 0),
    totalRoles: Number(totalRoles ?? 0),
    todayLogins: Number(todayLogins ?? 0),
  }

  return {
    stats,
    userGrowthTrend: buildTrend(normalizedDays, userGrowthRows),
    loginTrend: buildTrend(normalizedDays, loginTrendRows),
  }
}
