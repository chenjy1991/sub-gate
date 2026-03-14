'use client'

import { useEffect, useState } from 'react'
import { getStats, getLineChartData, getBarChartData } from '@/services/dashboard'
import type { DashboardStats, ChartDataPoint } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Shield, LogIn } from 'lucide-react'
import { PermGuard } from '@/components/common/PermGuard'
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const statsCards = [
  { key: 'totalUsers', label: '总用户数', icon: Users, color: 'text-blue-600' },
  { key: 'activeUsers', label: '活跃用户', icon: TrendingUp, color: 'text-green-600' },
  { key: 'totalRoles', label: '角色数量', icon: Shield, color: 'text-purple-600' },
  { key: 'todayLogins', label: '今日登录', icon: LogIn, color: 'text-orange-600' },
] as const

function StatsCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsCards.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">{label}</CardTitle>
            <Icon size={18} className={color} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats[key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LineChartCard({ data }: { data: ChartDataPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">用户增长趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <ReLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#18181b" strokeWidth={2} dot={false} />
          </ReLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function BarChartCard({ data }: { data: ChartDataPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">每日登录次数</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <ReBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#18181b" radius={[4, 4, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lineData, setLineData] = useState<ChartDataPoint[]>([])
  const [barData, setBarData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getLineChartData(), getBarChartData()]).then(([s, l, b]) => {
      setStats(s)
      setLineData(l)
      setBarData(b)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="flex h-40 items-center justify-center text-zinc-400">加载中...</div>
  }

  return (
    <PermGuard code="dashboard">
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">数据看板</h1>
        {stats && <StatsCards stats={stats} />}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LineChartCard data={lineData} />
          <BarChartCard data={barData} />
        </div>
      </div>
    </PermGuard>
  )
}
