# 014 - 用户注册 — 执行记录（回填）

## 说明

本文件为历史执行记录回填，基于当前注册、激活与重发激活实现补录。

## 实际改动

### 后端能力
- `app/api/auth/register/route.ts` — 新增注册接口，创建未激活用户并分配默认角色
- `app/api/auth/activate/route.ts` — 新增激活接口
- `app/api/auth/resend-activation/route.ts` — 新增重发激活邮件接口
- `lib/auth.ts` — 增加激活 token 签发与校验能力
- `lib/mail.ts` — 增加激活邮件模板与发送逻辑
- `middleware.ts` — 放通注册、激活、重发激活等公开路径

### 页面与前端调用
- `app/register/page.tsx`、`app/activate/page.tsx` — 新增注册页与激活页
- `services/auth.ts` — 增加注册、激活、重发激活相关调用
- `app/login/page.tsx` — 补充注册入口与未激活提示联动
- `app/console/mail/page.tsx` — 扩展为系统配置页，支持站点域名配置

## 设计决策

1. 激活 token 继续使用 JWT，避免额外存储一次性令牌
2. 注册用户默认 `status = 0`，激活后再转为可登录状态
3. 激活链接的域名从 `sys_config.site` 读取，避免硬编码

## 验证

1. 当前仓库已包含 `/register`、`/activate` 以及三组认证公开接口
2. 本次为历史文档回填，未单独复现当次功能开发过程
