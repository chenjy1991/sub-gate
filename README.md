# SubGate

开源的代理节点订阅管理平台。多协议解析、多格式订阅分发、RBAC 权限控制，Docker 一行命令部署。

## 功能特性

- **多协议支持**：VMess、VLESS、Trojan、Shadowsocks、Hysteria2 五种协议，链接一键解析导入
- **订阅分发**：自动生成 Base64、Clash、Surge、QuantumultX 四种格式订阅链接
- **权限控制**：基于 RBAC 的细粒度权限管理，按角色和用户灵活分配订阅访问权限
- **用户注册**：支持邮箱注册 + 激活，管理员可管理用户状态和角色
- **节点检测**：TCP 连通性检测，实时查看节点可用状态
- **系统配置**：站点域名、SMTP 邮件配置，支持测试邮件发送
- **一键部署**：基于 Next.js 全栈架构，SQLite 零配置数据库，Docker 一行命令启动

## 快速开始

### Docker 部署（推荐）

```bash
docker run -d -p 3000:3000 -v subgate-data:/app/data chenjy0580/sub-gate
```

启动后访问 `http://localhost:3000`，首次启动自动初始化数据库。

默认管理员账号：
- 用户名：`admin`
- 密码：`123456`

### Docker Compose

创建 `docker-compose.yml`：

```yaml
services:
  app:
    image: chenjy0580/sub-gate:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - JWT_SECRET=your-secret-key-change-in-production
    restart: unless-stopped
```

```bash
docker compose up -d
```

### 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `JWT_SECRET` | JWT 签名密钥，生产环境建议修改 | `sub-admin-jwt-secret-key-2024` |
| `PORT` | 服务端口 | `3000` |

## 本地开发

### 环境要求

- Node.js >= 20
- pnpm >= 9

### 安装依赖

```bash
pnpm install
```

### 初始化数据库

```bash
pnpm db:seed
```

### 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000`

### 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm db:seed      # 初始化数据库（保留已有数据）
pnpm db:reset     # 重置数据库（删除后重新初始化）
```

## 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 数据库 | SQLite (better-sqlite3) |
| ORM | Drizzle ORM |
| 认证 | JWT (jose) + HttpOnly Cookie |
| 样式 | Tailwind CSS |
| UI 组件 | shadcn/ui |
| 状态管理 | Zustand |
| 表单 | React Hook Form + Zod |
| 邮件 | Nodemailer |
| 部署 | Docker |

## 项目结构

```
├── app/                    # Next.js 页面 + API Routes
│   ├── (public)/           # 首页（Landing Page）
│   ├── login/              # 登录
│   ├── register/           # 注册
│   ├── activate/           # 邮箱激活
│   ├── console/            # 管理端页面
│   └── api/                # API 接口（34 个端点）
├── components/             # UI 组件
├── lib/                    # 工具库（数据库、认证、邮件、节点解析）
├── services/               # 前端 API 调用层
├── store/                  # Zustand 状态管理
├── types/                  # TypeScript 类型定义
└── specs/                  # 功能规格文档
```

## 开源协议

[MIT](LICENSE)
