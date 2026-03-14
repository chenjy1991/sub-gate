import Link from 'next/link'
import { Globe, Rss, Shield, Container, Github, ArrowRight, Zap } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: '多协议支持',
    desc: '支持 VMess、VLESS、Trojan、Shadowsocks、Hysteria2 五种主流协议，链接一键解析导入',
  },
  {
    icon: Rss,
    title: '订阅分发',
    desc: '自动生成 Base64、Clash、Surge、QuantumultX 四种格式订阅链接，兼容主流客户端',
  },
  {
    icon: Shield,
    title: '权限控制',
    desc: '基于 RBAC 的细粒度权限管理，按角色和用户灵活分配订阅访问权限',
  },
  {
    icon: Container,
    title: '一键部署',
    desc: 'Next.js 全栈架构，SQLite 零配置数据库，Docker 一行命令即可启动运行',
  },
]

const techStack = ['Next.js', 'TypeScript', 'SQLite', 'Drizzle ORM', 'Tailwind CSS', 'Docker']

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-400" />
            <span className="text-lg font-semibold">SubGate</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="https://github.com"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>
            <Link
              href="/console"
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-700"
            >
              控制台
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-24 text-center sm:pt-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            开源 · 自托管 · 轻量
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              SubGate
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400 sm:text-xl">
            开源的代理节点订阅管理平台
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-500">
            多协议解析、多格式订阅分发、RBAC 权限控制，Docker 一行命令部署
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/console"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium transition hover:bg-violet-500"
            >
              开始使用
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              文档
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800/50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-6 transition hover:border-zinc-700 hover:bg-zinc-900/60"
              >
                <div className="mb-4 inline-flex rounded-lg bg-zinc-800/50 p-2.5">
                  <f.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-zinc-800/50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-zinc-500">
            技术栈
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {techStack.map((t) => (
              <span
                key={t}
                className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3.5 py-1 text-xs text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-xs text-zinc-500">
          <span>&copy; {new Date().getFullYear()} SubGate</span>
          <Link
            href="https://github.com"
            target="_blank"
            className="transition hover:text-zinc-300"
          >
            GitHub
          </Link>
        </div>
      </footer>
    </div>
  )
}
