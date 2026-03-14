# 010 - Next.js 全栈迁移

## 需求背景

当前项目采用前后端分离架构（React + Vite / Spring Boot + MyBatis-Plus + SQLite），对于用户量很少的后台管理系统来说 Java + Spring Boot 过于笨重：
- JVM 内存占用 200-400MB，冷启动 5-15 秒
- Docker 镜像 300-500MB
- 前后端两个项目、两套构建、两个进程

迁移为 Next.js 全栈项目后：
- 单项目、单构建、单进程、单容器
- 内存占用 ~80-120MB，冷启动 <2 秒
- 未来可在同一项目中添加官网页面（SSR/SSG），管理端放在 `/console` 路径下

## 功能范围

### 必须迁移（功能 1:1 保持）

1. **认证系统**：登录/登出，改为 JWT + HttpOnly Cookie
2. **用户管理**：CRUD + 角色分配
3. **角色管理**：CRUD + 权限分配
4. **权限管理**：CRUD + 树形结构
5. **节点配置**：CRUD + 链接解析/导入/生成 + TCP 连通性检测
6. **订阅管理**：CRUD + 节点/角色/用户分配
7. **我的订阅**：当前用户可访问的订阅列表和详情
8. **外部订阅链接**：GET `/api/subscribe/{token}`，支持 base64/clash/surge/quantumultx 四种格式
9. **数据看板**：保持 mock 数据

### 不在本期范围

- 官网页面（预留 `app/(public)/` 目录结构）
- Dashboard 对接真实数据
- 新功能开发

## 技术选型

| 维度 | 决策 |
|---|---|
| 框架 | Next.js 15 (App Router) |
| ORM | Drizzle ORM + better-sqlite3 |
| 认证 | JWT (jose) + HttpOnly Cookie + bcryptjs |
| API 风格 | 保持全 POST（Route Handlers），响应格式 `{ code, msg, data }` 不变 |
| 管理端路由 | `/console/*` |
| 样式 | Tailwind CSS（保持现有配置） |
| UI 组件 | shadcn/ui（直接复制现有组件） |
| 状态管理 | Zustand（保持） |
| 表单 | React Hook Form + Zod（保持） |
| 部署 | Docker 单容器，`next start`，2C2G VPS |

## 数据模型

完全保持现有 9 张 SQLite 表，不做任何结构变更：
- sys_user, sys_role, sys_permission, sys_node, sys_subscription
- sys_user_role, sys_role_permission, sys_subscription_node, sys_subscription_role, sys_subscription_user

现有 `data/admin.db` 数据库文件可直接复用。
