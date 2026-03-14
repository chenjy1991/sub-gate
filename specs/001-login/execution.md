# 登录认证 — 执行记录

## 实际改动

### 后端
- `pom.xml` — 加 `spring-security-crypto` 依赖
- `AuthController.java` — BCrypt 密码验证、参数判空、新增 `/api/auth/logout`、登录时 token 存入 TokenHolder
- `common/TokenHolder.java`（新增）— `ConcurrentHashMap<String, Long>` 存储 token → userId
- `config/AuthInterceptor.java`（新增）— 从 Authorization 请求头校验 token，无效返回 401
- `config/WebMvcConfig.java`（新增）— 注册拦截器，拦截 `/api/**`，排除 `/api/auth/login`
- `db/init.sql` — admin 密码改为 BCrypt 哈希，加 UPDATE 语句兼容已有明文密码
- `SysUserService.java` — 删除未使用的 `import java.util.Map`

### 前端
- `src/lib/request.ts`（新增）— 通用请求函数，自动带 token、检查 res.ok、处理 401 自动登出
- `src/services/auth.ts` — login() 加 res.ok 检查，logout() 对接后端接口
- `src/store/authStore.ts` — 类型改为 AuthUser
- `src/pages/login/LoginPage.tsx` — 已登录用户自动重定向（使用 `<Navigate>` 组件）
- `src/types/index.ts` — 新增 AuthUser 类型（登录用户），与 User 类型（用户管理）分离
- `src/components/layout/Header.tsx` — 退出按钮调用 auth.ts 的 logout()

## 遇到的问题
1. BCrypt 哈希值错误 — 最初使用了一个预计算的错误哈希，导致 admin/123456 无法登录。后用 Spring Security 的 BCryptPasswordEncoder 实际生成了正确哈希。
2. 已有数据库兼容 — `INSERT OR IGNORE` 不会更新已有记录的密码，需要额外 UPDATE 语句。UPDATE 条件用 `length(password) < 50` 判断是否为非 BCrypt 密码。

## 待优化
- Token 目前存在内存中，重启后失效。后续可考虑 Redis 或数据库持久化。
- 无 Token 过期机制。
