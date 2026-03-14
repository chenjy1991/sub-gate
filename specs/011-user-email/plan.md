# 011 - 用户 Email 字段 + 个人设置 - 实施计划

## 数据模型

`lib/db/schema.ts` — `sysUser` 新增：
```ts
email: text('email').notNull().unique()
```

`lib/db/seed.ts` — 建表 SQL 加 `email TEXT NOT NULL UNIQUE`，admin 种子数据加 `email: 'chenjy@chenjy.cn'`

## 接口设计

| 接口 | 改动 |
|---|---|
| POST /api/auth/login | 含 `@` 按 email 查，否则按 username 查；返回 user 加 email |
| **新增** POST /api/user/me | 从 JWT 拿 userId，查库返回当前用户信息（不含 password），含 roleCodes 和 permissions |
| POST /api/user/list | 返回 email；搜索改为 username OR email 模糊匹配 |
| POST /api/user/getById | 返回 email |
| POST /api/user/create | email 必填 + 格式校验 + 唯一性；username 格式校验（`/^[a-zA-Z][a-zA-Z0-9]*$/`）+ 唯一性 |
| POST /api/user/update | 判断权限：有 `user:update` 可改全部字段；无权限只能改自己的 nickname |

### user/update 权限逻辑

```
获取当前用户 JWT → auth
获取目标用户 ID → body.id

if auth.userId === body.id:
  if 有 user:update 权限:
    允许修改 username/email/nickname/password/status（管理员编辑自己）
  else:
    只允许修改 nickname（普通用户编辑自己）
else:
  if 有 user:update 权限:
    允许修改 username/email/nickname/password/status/roleIds
  else:
    返回 fail('无权限')
```

username 修改时做格式校验 + 唯一性校验（排除自身），email 修改时做格式校验 + 唯一性校验（排除自身）。

## 页面规划

| 页面 | 改动 |
|---|---|
| `app/login/page.tsx` | label 改"账号"，placeholder 改"用户名 / 邮箱" |
| `app/console/users/page.tsx` | 表格加 email 列 |
| `app/console/users/new/page.tsx` | 加 email 字段 + username 格式校验 |
| `app/console/users/[id]/edit/page.tsx` | 加 email 字段；管理员可编辑 username/email |
| **新增** `app/console/settings/page.tsx` | 个人设置：调 `/api/user/me` 获取信息，只能改 nickname，username/email disabled；保存后更新 authStore |
| `components/layout/Sidebar.tsx` | 底部加"个人设置"菜单项（无需权限，所有登录用户可见） |

## 涉及文件清单

### 新增（2 个）
- `app/api/user/me/route.ts`
- `app/console/settings/page.tsx`

### 修改（14 个）
- `lib/db/schema.ts`
- `lib/db/seed.ts`
- `app/api/auth/login/route.ts`
- `app/api/user/list/route.ts`
- `app/api/user/getById/route.ts`
- `app/api/user/create/route.ts`
- `app/api/user/update/route.ts`
- `types/index.ts`
- `services/users.ts`
- `app/login/page.tsx`
- `app/console/users/page.tsx`
- `app/console/users/new/page.tsx`
- `app/console/users/[id]/edit/page.tsx`
- `components/layout/Sidebar.tsx`
