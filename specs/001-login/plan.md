# 登录认证 — 计划

## 数据模型
- `sys_user` 表：id, username, password(BCrypt), nickname, status, created_at
- `sys_user_role` 关联表：user_id, role_id

## 后端接口
| 路径 | 说明 |
|------|------|
| `POST /api/auth/login` | 登录，返回 `{ token, user }` |
| `POST /api/auth/logout` | 登出，移除 token |

## 后端关键组件
- `AuthController` — 登录/登出接口，BCrypt 密码验证，参数判空
- `TokenHolder` — `ConcurrentHashMap<String, Long>` 存储 token → userId
- `AuthInterceptor` — `HandlerInterceptor`，校验 Authorization 请求头
- `WebMvcConfig` — 注册拦截器，拦截 `/api/**`，排除 `/api/auth/login`

## 前端页面
- `/login` — LoginPage，表单登录，已登录自动重定向
- `authStore` — Zustand + persist，存储 token 和 AuthUser
- `AuthGuard` — 包裹受保护路由，未登录跳转 `/login`

## 前端通用请求函数
- `src/lib/request.ts` — 自动携带 token、处理 401 自动登出、中文错误提示

## 涉及文件
### 后端
- `controller/AuthController.java`
- `common/TokenHolder.java`（新增）
- `config/AuthInterceptor.java`（新增）
- `config/WebMvcConfig.java`（新增）
- `db/init.sql`（密码改 BCrypt 哈希）
- `pom.xml`（加 spring-security-crypto）

### 前端
- `src/lib/request.ts`（新增）
- `src/services/auth.ts`
- `src/store/authStore.ts`
- `src/pages/login/LoginPage.tsx`
- `src/components/common/AuthGuard.tsx`
