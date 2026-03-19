# 010 - Next.js 全栈迁移 — 执行记录（回填）

## 说明

本文件为历史执行记录回填，基于当前仓库结构与现有代码状态补录。

## 实际改动

### 项目骨架
- `app/` — 建立 Next.js App Router 目录，拆分公开页、登录页、管理端页面与 API Route Handlers
- `components/layout/` — 落地管理端侧边栏、顶部栏等布局组件
- `services/`、`store/`、`types/` — 将原前端调用层、状态管理和类型定义迁移到单仓结构

### 后端能力
- `lib/db/schema.ts`、`lib/db/index.ts`、`lib/db/seed.ts` — 使用 Drizzle ORM + SQLite 重建数据访问层
- `lib/auth.ts`、`middleware.ts` — 使用 JWT + HttpOnly Cookie 替代原有服务端内存 token 方案
- `app/api/**/route.ts` — 将用户、角色、权限、节点、订阅、我的订阅等接口迁移到 Next.js Route Handlers
- `lib/node/` — 迁移节点解析、链接生成、订阅输出等核心纯逻辑

### 工程化
- `Dockerfile`、`docker-compose.yml`、`next.config.ts` — 保持单容器部署与 `standalone` 输出能力
- `package.json`、`drizzle.config.ts` — 对齐全栈项目依赖与构建脚本

## 设计决策

1. 使用 Next.js 15 App Router 统一前后端，减少双项目和双进程维护成本
2. 认证改为 JWT + HttpOnly Cookie，由 `middleware.ts` 负责登录态拦截
3. 数据层保持 SQLite，不改业务表结构，降低迁移成本
4. 管理端统一收口到 `/console/*`，为后续官网页面预留公开路由空间

## 验证

1. 当前仓库结构可确认全栈迁移结果已落地
2. 本次为历史文档回填，未单独复现迁移当次提交的执行环境
