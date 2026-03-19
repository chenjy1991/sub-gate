# 013 - 邮件发送配置 - 实施计划

## 数据模型

`lib/db/schema.ts` 新增 `sysConfig` 表。
`lib/db/seed.ts` 新增建表 SQL + 权限种子数据 + admin 邮箱改为 `admin@subgate.com`。

## 接口设计

| 接口 | 说明 |
|---|---|
| POST `/api/config/get` | body: `{ key }` → 返回配置值（明文） |
| POST `/api/config/save` | body: `{ key, value, remark? }` → 保存配置（upsert） |
| POST `/api/mail/test` | body: `{ to }` → 读取邮件配置发送 HTML 测试邮件，失败返回具体错误 |

## 权限

| ID | parentId | name | code | type | sort |
|---|---|---|---|---|---|
| 100060 | 100001 | 邮件配置 | system:mail | menu | 4 |
| 100061 | 100060 | 查看配置 | mail:list | button | 1 |
| 100062 | 100060 | 保存配置 | mail:config | button | 2 |
| 100063 | 100060 | 发送测试 | mail:test | button | 3 |

## 页面规划

`app/console/mail/page.tsx`：
- 表单：host、port、secure（开关）、user、pass（password input）、from
- 保存按钮
- 测试发送区域：收件邮箱输入 + 发送按钮 + 成功/失败提示（失败显示具体错误）

## 涉及文件清单

### 新增（6 个）
- `app/api/config/get/route.ts`
- `app/api/config/save/route.ts`
- `app/api/mail/test/route.ts`
- `app/console/mail/page.tsx`
- `lib/mail.ts`
- `services/config.ts`

### 修改（5 个）
- `lib/db/schema.ts` — 新增 sysConfig 表
- `lib/db/seed.ts` — 建表 SQL + 权限 + admin 邮箱
- `components/layout/Sidebar.tsx` — 系统管理下加邮件配置
- `package.json` — 加 nodemailer
- `types/index.ts` — 加 MailConfig 类型
