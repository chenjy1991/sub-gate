import type { DashboardStats, ChartDataPoint } from '@/types'

const mockStats: DashboardStats = {
  totalUsers: 128,
  activeUsers: 96,
  totalRoles: 5,
  todayLogins: 42,
}

const mockLineData: ChartDataPoint[] = [
  { date: '2024-01', value: 65, label: '1月' },
  { date: '2024-02', value: 78, label: '2月' },
  { date: '2024-03', value: 90, label: '3月' },
  { date: '2024-04', value: 81, label: '4月' },
  { date: '2024-05', value: 95, label: '5月' },
  { date: '2024-06', value: 110, label: '6月' },
]

const mockBarData: ChartDataPoint[] = [
  { date: '2024-01', value: 120, label: '1月' },
  { date: '2024-02', value: 150, label: '2月' },
  { date: '2024-03', value: 180, label: '3月' },
  { date: '2024-04', value: 160, label: '4月' },
  { date: '2024-05', value: 200, label: '5月' },
  { date: '2024-06', value: 230, label: '6月' },
]

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getStats(): Promise<DashboardStats> {
  await delay(300)
  return mockStats
}

export async function getLineChartData(): Promise<ChartDataPoint[]> {
  await delay(200)
  return mockLineData
}

export async function getBarChartData(): Promise<ChartDataPoint[]> {
  await delay(200)
  return mockBarData
}
