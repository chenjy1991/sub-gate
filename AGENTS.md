# AGENTS.md

> 与用户交流、编写文档时，能用中文的地方一律使用中文。

## 工作规范

每个新功能开发必须严格按以下流程执行：

**⚠️ 硬性约束：禁止在未完成 Plan 阶段确认、且未创建 requirements.md 和 plan.md 的情况下执行任何代码编写操作。如果 Agent 试图跳过此流程，用户应立即中断并要求返回 Plan 阶段。**

### 1. Plan 阶段（必须）
- 新功能开发**必须以 plan 模式开始**，先与用户讨论需求、确认方案
- 禁止跳过 plan 直接写代码
- Plan 阶段只做讨论和方案设计，**不允许创建、修改任何代码文件或执行任何 shell 命令**

### 2. Spec 创建（plan 确认后，编码前）
- 在 `specs/` 下创建功能文件夹（编号递增，如 `011-xxx/`）
- 创建 `requirements.md` — 记录需求背景、功能列表、数据字段
- 创建 `plan.md` — 记录数据模型、接口设计、页面规划、涉及文件清单
- **两个文件创建完毕并经用户确认后，再开始编码**

### 3. 编码执行
- 按 plan.md 中的计划逐步实现
- 改动完成后执行编译验证（`pnpm build`）

### 4. Execution 记录（编码完成后）
- 创建 `execution.md` — 记录实际改动文件、设计决策、遇到的问题
- 同步更新 AGENTS.md 中的「已有功能」表格

---

## 项目概览

Next.js 全栈后台管理系统（RBAC），单项目、单构建、单进程：
- **框架**：Next.js 15 (App Router) + TypeScript
- **ORM**：Drizzle ORM + better-sqlite3 (SQLite)
- **认证**：JWT (jose) + HttpOnly Cookie + bcryptjs
- **前端**：React 19 + Tailwind CSS + shadcn/ui + Zustand + React Hook Form + Zod
- **部署**：Docker 单容器，`next start`

---

## 构建 / 检查 / 测试命令

```bash
pnpm dev              # 启动开发服务器（勿在 agent 中运行）
pnpm build            # next build（类型检查 + 构建）
pnpm start            # 启动生产服务器（勿在 agent 中运行）
pnpm db:seed          # 初始化数据库 + 种子数据
```

Docker 部署：
```bash
docker compose up -d                    # 启动
docker run -d -p 3000:3000 -v ./data:/app/data image-name  # 单行启动
```

当前无测试框架配置。

---

## 项目结构

```
/（项目根目录）
├── app/
│   ├── layout.tsx                    # 根 layout
│   ├── globals.css                   # 全局样式 + CSS 变量
│   ├── (public)/page.tsx             # 官网占位（重定向到 /console）
│   ├── login/page.tsx                # 登录页
│   ├── console/
│   │   ├── layout.tsx                # 管理端 layout（侧边栏 + 顶栏）
│   │   ├── ConsoleLayout.tsx         # 客户端 layout 组件
│   │   ├── page.tsx                  # 重定向到 dashboard
│   │   ├── dashboard/page.tsx
│   │   ├── my-subscriptions/page.tsx
│   │   ├── users/{page,new/page,[id]/edit/page}.tsx
│   │   ├── roles/page.tsx
│   │   ├── permissions/page.tsx
│   │   ├── nodes/{page,new/page,[id]/edit/page}.tsx
│   │   └── subscriptions/{page,new/page,[id]/page,[id]/edit/page}.tsx
│   └── api/                          # API Route Handlers（31 个端点）
│       ├── auth/{login,logout}/route.ts
│       ├── user/{list,getById,create,update,delete}/route.ts
│       ├── role/{list,create,update,delete,assignPermissions,getPermissionIds}/route.ts
│       ├── permission/{list,tree,create,update,delete}/route.ts
│       ├── node/{list,getById,create,update,delete,parse,import,generateLink,check}/route.ts
│       ├── subscription/{list,getById,detail,create,update,delete,assignRoles,assignUsers}/route.ts
│       ├── my-subscription/{list,detail}/route.ts
│       └── subscribe/[token]/route.ts    # GET，外部订阅链接，免鉴权
├── lib/
│   ├── db/
│   │   ├── index.ts                  # Drizzle 实例 + SQLite 连接
│   │   ├── schema.ts                 # 9 张表定义
│   │   └── seed.ts                   # 种子数据脚本
│   ├── auth.ts                       # JWT 签发/验证、bcrypt、Cookie 操作
│   ├── result.ts                     # ok() / fail() / pageResult() 响应工具
│   ├── request.ts                    # 前端通用请求函数
│   ├── permission.ts                 # 前端权限判断工具
│   ├── utils.ts                      # cn() 工具
│   └── node/
│       ├── parser.ts                 # 5 协议链接解析（vmess/vless/trojan/ss/hy2）
│       ├── generator.ts              # 5 协议链接生成
│       └── subscription.ts           # 4 格式订阅输出（base64/clash/surge/quantumultx）
├── components/
│   ├── ui/                           # shadcn/ui 组件 — 不要直接修改
│   └── layout/
│       ├── Sidebar.tsx               # 侧边栏导航
│       └── Header.tsx                # 顶部栏
├── store/
│   ├── authStore.ts                  # 认证状态（persist，只存 user，token 由 cookie 管理）
│   └── appStore.ts                   # UI 状态（sidebar 折叠）
├── types/index.ts                    # 所有前端类型定义
├── services/                         # 前端 API 调用层
│   ├── auth.ts, users.ts, roles.ts, permissions.ts
│   ├── nodes.ts, subscriptions.ts, mySubscriptions.ts
│   └── dashboard.ts                  # 仍为 mock
├── middleware.ts                     # Next.js 路由中间件（JWT 鉴权）
├── next.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── drizzle.config.ts
├── Dockerfile
├── docker-compose.yml
└── specs/                            # 功能规格文档
```

---

## 代码规范

### 文件与目录命名

- 页面：`app/console/{模块}/page.tsx`（Next.js 文件系统路由）
- 服务文件：`services/camelCase.ts`
- Store 文件：`store/camelCase.ts`
- 类型定义：集中在 `types/index.ts`
- UI 组件（shadcn/ui）：`components/ui/` — **不要直接修改**

### 路径别名

`@/` 映射到项目根目录（tsconfig.json 已配置），所有项目内导入必须使用 `@/` 前缀。

### 导入顺序

1. React / Next.js（`react`、`next/navigation`、`next/link`）
2. 第三方库（`zod`、`zustand`、`react-hook-form`）
3. 项目服务层（`@/services/*`）
4. 项目类型（`@/types`）
5. UI 组件（`@/components/ui/*`）
6. 图标（`lucide-react`）

### TypeScript 规范

- 使用 `interface` 定义数据模型
- 表单数据类型用 `z.infer<typeof schema>` 从 Zod schema 推导
- `strict: true`，启用 `noUnusedLocals` 和 `noUnusedParameters`

### 页面组件规范

- 管理端页面顶部加 `'use client'`
- 使用 `export default function PageName()` 默认导出
- 路由导航用 `useRouter()` from `next/navigation`
- 动态参数用 `useParams()` from `next/navigation`
- 当前路径用 `usePathname()` from `next/navigation`

### API Route Handler 规范

- 文件路径：`app/api/{模块}/{操作}/route.ts`
- **所有接口均为 POST**（subscribe 除外为 GET）
- 导出 `POST` 函数（或 `GET`）
- 返回 `ok(data)` / `fail("中文消息")`，响应格式 `{ code: 0, msg, data }`
- 鉴权由 `middleware.ts` 统一处理，API 内通过 `getAuthFromCookie()` 获取当前用户
- 数据库操作用 Drizzle ORM 同步 API（`.get()` / `.all()` / `.run()`）

### 格式

- 无分号
- 单引号
- 2 空格缩进

---

## 重要注意事项

- **认证方式**：JWT + HttpOnly Cookie，无状态，重启不丢失。Cookie 名 `token`，无 Bearer 前缀
- **密码加密**：bcryptjs 哈希，种子账号 `admin / 123456`
- **数据库**：SQLite，文件路径 `./data/admin.db`，Docker 部署时挂载 volume
- **数据库初始化**：`lib/db/seed.ts` 通过 `sqlite.exec()` 执行建表 + 种子数据，`pnpm db:seed` 运行
- **SQL 幂等性**：建表用 `CREATE TABLE IF NOT EXISTS`
- **路由鉴权**：`middleware.ts` 拦截 `/api/*` 和 `/console/*`，免鉴权路径：`/api/auth/login`、`/api/subscribe/*`、`/login`、`/(public)/*`
- **前端请求**：`lib/request.ts` 自动处理 401 跳转登录，Cookie 自动携带无需手动设置 header
- **Dashboard mock**：`services/dashboard.ts` 仍为 mock 数据，未对接真实 API
- **节点链接解析**：支持 vmess/vless/trojan/ss/hysteria2 五种协议
- **订阅输出格式**：支持 base64/clash/surge/quantumultx 四种格式
- **standalone 输出**：`next.config.ts` 配置 `output: 'standalone'`，用于 Docker 部署

---

## Specs 功能规格文档

`specs/` 目录记录每个已完成功能的规格文档，每个功能一个文件夹，包含三个文件：

| 文件 | 内容 |
|------|------|
| `requirements.md` | 需求背景、功能列表、数据字段 |
| `plan.md` | 数据模型、接口设计、页面规划、涉及文件清单 |
| `execution.md` | 实际改动记录、设计决策、遇到的问题 |

### 已有功能

| 编号 | 功能 | 目录 |
|------|------|------|
| 001 | 登录认证 | `specs/001-login/` |
| 002 | 角色管理 | `specs/002-role-management/` |
| 003 | 用户管理 | `specs/003-user-management/` |
| 004 | 节点配置 | `specs/004-node-management/` |
| 005 | 订阅管理 | `specs/005-subscription/` |
| 006 | 节点可用性检测 | `specs/006-node-check/` |
| 007 | 节点链接生成 | `specs/007-node-link-generate/` |
| 008 | 我的订阅 | `specs/008-my-subscription/` |
| 009 | 权限管理 | `specs/009-permission/` |
| 010 | Next.js 全栈迁移 | `specs/010-nextjs-migration/` |
| 011 | 状态切换功能 | `specs/011-status-toggle/` |

新增功能时，按 `{编号}-{功能名}/` 格式创建目录，编号递增。
