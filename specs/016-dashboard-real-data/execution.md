# 016 - 数据看板真实数据化 - 执行记录

## 实际改动概览

本次改造将 dashboard 从前端 mock 数据切换为真实数据库统计，并同步补齐了支撑看板的最小数据模型与采集链路。

落地内容包括：

1. 新增 dashboard 聚合查询与 `POST /api/dashboard/overview`
2. `services/dashboard.ts` 改为真实请求，页面改为单次请求获取看板全量数据
3. 新增登录历史、节点检测历史、订阅访问历史三张表
4. 为用户、角色、权限、节点、订阅补齐时间字段与节点检测快照字段
5. 在登录、激活、节点检测、订阅下发等链路接入真实数据写入

## 实际改动文件

### 新增文件

- `app/api/dashboard/overview/route.ts`
- `lib/dashboard.ts`
- `lib/datetime.ts`
- `lib/request-meta.ts`
- `drizzle/0002_lethal_changeling.sql`
- `drizzle/meta/0002_snapshot.json`

### 主要修改

- `lib/db/schema.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/activate/route.ts`
- `app/api/user/create/route.ts`
- `app/api/user/update/route.ts`
- `app/api/role/update/route.ts`
- `app/api/role/assignPermissions/route.ts`
- `app/api/permission/update/route.ts`
- `app/api/node/check/route.ts`
- `app/api/node/update/route.ts`
- `app/api/subscription/update/route.ts`
- `app/api/subscription/assignRoles/route.ts`
- `app/api/subscription/assignUsers/route.ts`
- `app/api/subscribe/[token]/route.ts`
- `services/dashboard.ts`
- `app/console/dashboard/page.tsx`
- `types/index.ts`
- `AGENTS.md`

## 关键设计决策

1. 保持 dashboard 首版为“4 张卡片 + 2 张图表”，只替换为真实数据，不额外扩展复杂布局
2. `活跃用户` 定义为“近 7 天有成功登录记录的去重用户数”
3. 登录、节点检测、订阅访问日志采用失败可降级策略，不能阻断主业务链路
4. dashboard 统一走单个 overview 接口，避免页面发起三次独立请求
5. 趋势图按自然日补零，保证历史为空时仍可稳定渲染

## 遇到的问题

### 1. SQLite 迁移限制

Drizzle 自动生成的 migration 对旧表采用 `ADD COLUMN ... NOT NULL`，在已有数据的 SQLite 上会失败。

处理方式：

1. 手工改写 migration
2. 对 `sys_user`、`sys_role`、`sys_permission`、`sys_node`、`sys_subscription` 采用“重建表 + 回填旧数据”的方式升级

### 2. 历史数据不存在

项目尚未正式上线，登录历史、节点检测历史、订阅访问历史都无法回溯补算。

处理方式：

1. 接受历史从本次改造上线后开始累计
2. dashboard 对空历史返回 0 值和补零趋势，而不是伪造历史

## 验证结果

1. `pnpm db:migrate` 通过
2. `pnpm build` 通过
3. `pnpm test` 通过
