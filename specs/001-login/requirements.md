# 登录认证 — 需求

## 背景
后台管理系统需要用户通过账号密码登录，登录后才能访问管理页面。

## 功能需求
1. 用户通过用户名 + 密码登录
2. 登录成功后返回 token 和用户信息，前端持久化到 localStorage
3. 所有 `/api/**` 接口（除 `/api/auth/login`）需要校验 token
4. 支持登出，清除 token
5. 已登录用户访问 `/login` 页面自动重定向到 `/dashboard`
6. 前端 401 响应自动登出并跳转登录页

## 业务规则
- 种子账号：`admin / 123456`
- 密码使用 BCrypt 加密存储
- Token 为 UUID，存储在后端内存 ConcurrentHashMap 中
- 登录失败返回中文错误消息
