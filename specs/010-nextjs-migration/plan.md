# 010 - Next.js 全栈迁移 - 实施计划

## 项目结构

```
/（项目根目录）
├── AGENTS.md
├── specs/
├── app/
│   ├── layout.tsx                    # 根 layout（html/body + 全局样式）
│   ├── (public)/
│   │   └── page.tsx                  # 占位首页，重定向到 /console
│   ├── login/
│   │   └── page.tsx
│   └── console/
│       ├── layout.tsx                # 管理端 layout（侧边栏 + 顶栏）
│       ├── page.tsx                  # 重定向到 dashboard
│       ├── dashboard/page.tsx
│       ├── my-subscriptions/page.tsx
│       ├── users/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── roles/page.tsx
│       ├── permissions/page.tsx
│       ├── nodes/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       └── subscriptions/
│           ├── page.tsx
│           ├── new/page.tsx
│           ├── [id]/page.tsx
│           └── [id]/edit/page.tsx
├── app/api/
│   ├── auth/{login,logout}/route.ts
│   ├── user/{list,getById,create,update,delete}/route.ts
│   ├── role/{list,create,update,delete,assignPermissions,getPermissionIds}/route.ts
│   ├── permission/{list,tree,create,update,delete}/route.ts
│   ├── node/{list,getById,create,update,delete,parse,import,generateLink,check}/route.ts
│   ├── subscription/{list,getById,detail,create,update,delete,assignRoles,assignUsers}/route.ts
│   ├── my-subscription/{list,detail}/route.ts
│   └── subscribe/[token]/route.ts
├── lib/
│   ├── db/
│   │   ├── index.ts                  # Drizzle 实例
│   │   ├── schema.ts                 # 9 张表定义
│   │   └── seed.ts                   # 种子数据脚本
│   ├── auth.ts                       # JWT + bcrypt + 鉴权工具
│   ├── result.ts                     # Result / PageResult 响应工具
│   └── node/
│       ├── parser.ts                 # 5 协议链接解析
│       ├── generator.ts              # 5 协议链接生成
│       └── subscription.ts           # 4 格式订阅输出
├── components/
│   ├── ui/                           # shadcn/ui（从 front/ 复制）
│   └── layout/
│       ├── Sidebar.tsx
│       └── Header.tsx
├── store/
│   ├── authStore.ts
│   └── appStore.ts
├── types/
│   └── index.ts
├── services/                         # 前端 API 调用层（从 front/ 迁移）
│   ├── auth.ts
│   ├── users.ts
│   ├── roles.ts
│   ├── permissions.ts
│   ├── nodes.ts
│   ├── subscriptions.ts
│   ├── mySubscriptions.ts
│   └── dashboard.ts
├── middleware.ts                      # Next.js 路由中间件
├── next.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
├── drizzle.config.ts
├── Dockerfile
└── docker-compose.yml
```

## 数据模型（Drizzle Schema）

完全保持现有 9 张 SQLite 表，字段类型 1:1 映射：

### 实体表
- `sys_user`：id(integer PK), username(text unique), password(text), nickname(text), status(integer default 1), created_at(text default now)
- `sys_role`：id(integer PK), name(text), code(text unique), remark(text), status(integer default 1)
- `sys_permission`：id(integer PK), parent_id(integer default 0), name(text), code(text unique), type(text default 'menu'), sort(integer default 0), remark(text)
- `sys_node`：id(integer PK), name(text), address(text), port(integer), protocol(text), uuid(text), alter_id(integer default 0), security(text), network(text), tls(integer default 0), sni(text), path(text), host(text), raw_link(text), remark(text), status(integer default 1), sort(integer default 0)
- `sys_subscription`：id(integer PK), name(text), remark(text), status(integer default 1)

### 关联表（复合主键）
- `sys_user_role`：user_id, role_id
- `sys_role_permission`：role_id, permission_id
- `sys_subscription_node`：subscription_id, node_id
- `sys_subscription_role`：subscription_id, role_id
- `sys_subscription_user`：subscription_id, user_id

## 接口设计

### 认证变更

| 项目 | 旧方案 | 新方案 |
|---|---|---|
| Token 类型 | 随机 UUID 字符串 | JWT（jose 库签发） |
| Token 存储 | 服务端内存 ConcurrentHashMap | 无状态，不存储 |
| Token 传递 | Authorization header | HttpOnly Cookie（名称 `token`） |
| 密码哈希 | Spring BCryptPasswordEncoder | bcryptjs |
| 路由鉴权 | Spring AuthInterceptor | Next.js middleware.ts |
| 免鉴权路径 | /api/auth/login | /api/auth/login, /api/subscribe/*, /login, /(public)/* |

JWT Payload：`{ userId, username, role, exp }`

### API 端点（31 个，全部保持 POST，subscribe 除外）

响应格式不变：`{ code: 0, msg: "ok", data: T }` / `{ code: 1, msg: "错误信息" }`

#### auth（2 个）
- POST /api/auth/login → 验证密码，签发 JWT，Set-Cookie
- POST /api/auth/logout → 清除 Cookie

#### user（5 个）
- POST /api/user/list → 分页 + username 模糊搜索，返回 UserVO（含 roleCodes）
- POST /api/user/getById → 按 ID 查询
- POST /api/user/create → 创建用户 + 分配角色
- POST /api/user/update → 更新用户（密码非空才更新）
- POST /api/user/delete → 删除用户

#### role（6 个）
- POST /api/role/list → 分页
- POST /api/role/create → 创建
- POST /api/role/update → 更新
- POST /api/role/delete → 删除
- POST /api/role/assignPermissions → 先删后插
- POST /api/role/getPermissionIds → 查询角色权限 ID 列表

#### permission（5 个）
- POST /api/permission/list → 分页
- POST /api/permission/tree → 树形结构
- POST /api/permission/create → 创建
- POST /api/permission/update → 更新
- POST /api/permission/delete → 删除

#### node（9 个）
- POST /api/node/list → 分页 + keyword 搜索
- POST /api/node/getById → 按 ID 查询
- POST /api/node/create → 创建
- POST /api/node/update → 更新
- POST /api/node/delete → 删除
- POST /api/node/parse → 批量解析链接（vmess/vless/trojan/ss/hy2）
- POST /api/node/import → 批量导入
- POST /api/node/generateLink → 生成单节点链接
- POST /api/node/check → TCP 连通性检测（net.Socket, 5s 超时）

#### subscription（8 个）
- POST /api/subscription/list → 分页
- POST /api/subscription/getById → 返回关联 ID
- POST /api/subscription/detail → 返回关联完整对象
- POST /api/subscription/create → 创建 + 分配节点
- POST /api/subscription/update → 更新
- POST /api/subscription/delete → 删除
- POST /api/subscription/assignRoles → 分配角色
- POST /api/subscription/assignUsers → 分配用户

#### my-subscription（2 个）
- POST /api/my-subscription/list → 当前用户可访问的订阅（直接分配 + 角色间接分配）
- POST /api/my-subscription/detail → 订阅详情（含权限校验）

#### subscribe（1 个 GET，免鉴权）
- GET /api/subscribe/[token]?type=base64|clash|surge|quantumultx

## 页面规划

### 路由映射

| 现有路由 | Next.js 路由 | 文件 |
|---|---|---|
| /login | /login | app/login/page.tsx |
| /dashboard | /console/dashboard | app/console/dashboard/page.tsx |
| /my-subscriptions | /console/my-subscriptions | app/console/my-subscriptions/page.tsx |
| /users | /console/users | app/console/users/page.tsx |
| /users/new | /console/users/new | app/console/users/new/page.tsx |
| /users/:id/edit | /console/users/[id]/edit | app/console/users/[id]/edit/page.tsx |
| /roles | /console/roles | app/console/roles/page.tsx |
| /permissions | /console/permissions | app/console/permissions/page.tsx |
| /nodes | /console/nodes | app/console/nodes/page.tsx |
| /nodes/new | /console/nodes/new | app/console/nodes/new/page.tsx |
| /nodes/:id/edit | /console/nodes/[id]/edit | app/console/nodes/[id]/edit/page.tsx |
| /subscriptions | /console/subscriptions | app/console/subscriptions/page.tsx |
| /subscriptions/new | /console/subscriptions/new | app/console/subscriptions/new/page.tsx |
| /subscriptions/:id | /console/subscriptions/[id] | app/console/subscriptions/[id]/page.tsx |
| /subscriptions/:id/edit | /console/subscriptions/[id]/edit | app/console/subscriptions/[id]/edit/page.tsx |

### 前端迁移要点

- 所有管理端页面加 `'use client'`
- `useNavigate()` → `useRouter()` from `next/navigation`
- `useParams()` → `useParams()` from `next/navigation`
- 路径全部加 `/console` 前缀
- `request.ts` 移除手动 Authorization header（cookie 自动携带）
- `authStore` 移除 token 字段，只存 user 信息
- `AppLayout` → `app/console/layout.tsx`
- `AuthGuard` → `middleware.ts` 服务端鉴权

## 执行阶段

### 阶段 1：项目骨架
1. 初始化 Next.js 项目（pnpm create next-app）
2. 配置 Tailwind、路径别名 `@/`
3. 安装依赖：drizzle-orm, better-sqlite3, jose, bcryptjs, zustand, react-hook-form, zod, recharts, lucide-react, @radix-ui 系列
4. 实现 `lib/db/schema.ts`（9 张表）
5. 实现 `lib/db/index.ts`（Drizzle 实例）
6. 实现 `lib/db/seed.ts`（种子数据）
7. 实现 `lib/auth.ts`（JWT 签发/验证、bcrypt、鉴权工具函数）
8. 实现 `lib/result.ts`（Result / PageResult）
9. 实现 `middleware.ts`（路由鉴权）

### 阶段 2：API 层迁移
1. auth 模块（2 个端点）
2. user 模块（5 个端点）
3. role 模块（6 个端点）
4. permission 模块（5 个端点）
5. node 模块（9 个端点）+ `lib/node/` 链接解析/生成/订阅输出
6. subscription 模块（8 个端点）
7. my-subscription 模块（2 个端点）
8. subscribe 外部订阅端点（1 个 GET）

### 阶段 3：前端迁移
1. 复制 shadcn/ui 组件到 `components/ui/`
2. 迁移 types、store、services、lib 工具
3. 实现根 layout + 登录页
4. 实现 console layout（侧边栏 + 顶栏）
5. 逐页迁移：dashboard → users → roles → permissions → nodes → subscriptions → my-subscriptions

### 阶段 4：集成验证 + Docker
1. `pnpm build` 构建通过
2. 全流程功能验证
3. Dockerfile + docker-compose.yml
4. 删除 `backend/` 和 `front/`
5. 更新 `AGENTS.md`

## 涉及文件清单

### 新建文件
- 根目录配置：package.json, next.config.ts, tsconfig.json, tailwind.config.js, postcss.config.js, drizzle.config.ts, middleware.ts, Dockerfile, docker-compose.yml
- lib/：db/index.ts, db/schema.ts, db/seed.ts, auth.ts, result.ts, node/parser.ts, node/generator.ts, node/subscription.ts, utils.ts, permission.ts
- app/：layout.tsx, (public)/page.tsx, login/page.tsx, console/layout.tsx, console/page.tsx, 及所有子页面
- app/api/：31 个 route.ts 文件
- components/：ui/（12 个组件复制）, layout/Sidebar.tsx, layout/Header.tsx
- store/：authStore.ts, appStore.ts
- types/：index.ts
- services/：8 个服务文件

### 删除文件
- `backend/` 整个目录
- `front/` 整个目录

### 修改文件
- `AGENTS.md`：更新技术栈、构建命令、代码规范
