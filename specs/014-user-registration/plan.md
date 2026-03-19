# 014 - 用户注册 - 实施计划

## 接口设计

| 接口 | 方法 | 说明 |
|---|---|---|
| POST /api/auth/register | 公开 | 注册 + 发激活邮件 |
| POST /api/auth/activate | 公开 | 验证 token + 激活用户 |
| POST /api/auth/resend-activation | 公开 | 重发激活邮件（输入 email） |

## 站点配置

sys_config 中 config_key = 'site'：`{ "domain": "https://yourdomain.com", "name": "SubGate" }`

## 涉及文件清单

### 新增（5 个）
- app/api/auth/register/route.ts
- app/api/auth/activate/route.ts
- app/api/auth/resend-activation/route.ts
- app/register/page.tsx
- app/activate/page.tsx

### 修改（11 个）
- middleware.ts
- app/api/auth/login/route.ts
- app/login/page.tsx
- app/console/mail/page.tsx（改为系统配置）
- components/layout/Sidebar.tsx
- lib/db/seed.ts
- lib/mail.ts
- lib/auth.ts
- types/index.ts
- services/auth.ts
- services/config.ts
