# 012 - 用户 Email 字段 + 个人设置 — 执行记录（回填）

## 说明

本文件为历史执行记录回填。

## 实际改动

### 数据与接口
- `lib/db/schema.ts`、`lib/db/seed.ts` — 为用户表增加 `email` 字段，并更新管理员种子数据
- `app/api/auth/login/route.ts` — 支持用户名或邮箱登录
- `app/api/user/list/route.ts`、`app/api/user/getById/route.ts`、`app/api/user/create/route.ts`、`app/api/user/update/route.ts` — 返回并校验 `email`，同步处理用户名/邮箱唯一性
- `app/api/user/me/route.ts` — 新增当前用户信息接口

### 页面与前端调用
- `app/login/page.tsx` — 登录文案调整为“用户名 / 邮箱”
- `app/console/users/page.tsx`、`app/console/users/new/page.tsx`、`app/console/users/[id]/edit/page.tsx` — 增加邮箱展示与编辑能力
- `app/console/settings/page.tsx` — 新增个人设置页面
- `services/users.ts`、`services/auth.ts`、`types/index.ts`、`store/authStore.ts` — 对齐新增字段与当前用户模型
- `components/layout/Sidebar.tsx` — 增加个人设置入口

## 设计决策

1. `email` 作为用户唯一标识之一，同时保留原有 `username`
2. 登录时通过是否包含 `@` 判断按邮箱还是用户名查询
3. 普通用户仅允许修改自己的昵称，管理员可修改更完整的资料字段

## 验证

1. 当前代码结构中已包含 `email` 字段、`/api/user/me` 与个人设置页面
2. 本次为历史文档回填，未单独复现当次功能开发过程
