# 015 - 项目加固与工程化优化 — 执行记录

## 实际改动

### 安全与正确性
- `lib/api/auth.ts`、`lib/api/validation.ts`、`lib/api/schemas.ts` — 新增统一鉴权、授权和 Zod 校验工具
- `lib/jwt.ts`、`lib/auth.ts`、`middleware.ts` — 收敛 JWT Secret 配置与登录态校验逻辑，生产环境不再允许回退到默认密钥
- `app/api/auth/*`、`app/api/user/*`、`app/api/role/*`、`app/api/permission/*`、`app/api/node/*`、`app/api/subscription/*`、`app/api/config/*`、`app/api/mail/test/route.ts`、`app/api/my-subscription/*` — 批量接入服务端权限校验与入参校验
- `lib/result.ts`、`lib/request.ts` — 统一错误返回与前端中文错误透传
- `app/api/auth/register/route.ts`、`services/auth.ts`、`app/register/page.tsx` — 明确“用户已创建但邮件发送失败”的处理策略与前端提示

### 性能与一致性
- `app/api/user/list/route.ts` — 去掉逐用户查角色的 N+1 查询
- `app/api/auth/login/route.ts` — 收敛权限加载逻辑，减少全表拉取和内存过滤
- `app/api/subscription/detail/route.ts`、`app/api/my-subscription/list/route.ts` — 改为 join / 聚合查询
- `types/index.ts`、`services/*.ts`、`app/console/**` — 统一主键为数值类型，减少 `String()` / `Number()` 漂移
- `lib/config.ts`、`lib/mail.ts` — 收敛系统配置与 JSON 解析逻辑
- `lib/db/schema.ts`、`drizzle/0001_true_phantom_reporter.sql` — 为关联表补充外键约束，为关键查询字段补充索引，并在迁移中清理历史孤儿关联数据

### 工程化
- `drizzle/`、`lib/db/migrate.ts`、`lib/db/seed.ts` — 引入 migration 流程，seed 改为“迁移后初始化数据”
- `tests/lib/node/*.test.ts` — 补充节点解析、链接生成、订阅输出的最小测试集
- `.eslintrc.json`、`.prettierrc.json`、`.prettierignore`、`package.json`、`pnpm-lock.yaml` — 增加 lint / format / test / db 脚本与依赖
- `app/console/nodes/[id]/edit/page.tsx`、`app/console/nodes/page.tsx`、`app/console/roles/page.tsx`、`app/console/subscriptions/[id]/page.tsx`、`app/console/subscriptions/page.tsx`、`app/console/users/page.tsx` — 清理 React Hooks 依赖警告
- `AGENTS.md`、`specs/**/execution.md` — 补齐文档记录、修正历史 spec 编号冲突并同步当前项目状态

## 设计决策

1. 保留 `middleware.ts` 负责登录态拦截，接口内部通过公共工具做细粒度权限校验
2. 生产环境缺少 `JWT_SECRET` 直接报错，避免带默认密钥运行
3. 历史 spec 编号冲突直接通过目录顺延修正，保持编号连续，避免后续继续累积歧义
4. 测试框架优先采用 Node 原生 `node:test` + `tsx`，以最低成本覆盖核心纯函数

## 遇到的问题

1. 现有页面存在多处 `useEffect` 闭包依赖警告，需要统一收口后再启用 ESLint 校验
2. 旧版 `seed.ts` 同时承担建表与种子数据职责，迁移到 migration 后需要兼容已有 SQLite 数据
3. SQLite 为既有表补外键时无法直接 `ALTER TABLE`，需要通过重建关联表和迁移数据完成

## 验证

1. `pnpm lint` 通过
2. `pnpm test` 通过
3. `pnpm build` 通过
4. `pnpm db:migrate` 通过
5. `pnpm db:seed` 通过
