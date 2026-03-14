import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SubGate',
  description: 'SubGate 代理节点订阅管理平台',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
