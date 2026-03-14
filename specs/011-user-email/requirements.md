# 011 - 用户 Email 字段 + 个人设置

## 需求背景

用户表新增 email 字段，作为用户唯一标识之一。支持 username 或 email 登录。username 限制为英文+数字且英文开头。新增个人设置页面，普通用户只能修改昵称，管理员（有 `user:update` 权限）可修改 username/email。

## 功能列表

1. `sys_user` 表新增 `email` 字段（必填、唯一）
2. 登录支持 username 或 email（含 `@` 按 email 查，否则按 username 查）
3. 创建用户时 email 必填，校验格式 + 唯一性；username 校验格式（`/^[a-zA-Z][a-zA-Z0-9]*$/`）+ 唯一性
4. 编辑用户时：有 `user:update` 权限可改 username/email/nickname/password/status/roleIds；无权限只能改自己的 nickname
5. 用户列表和详情返回 email 字段
6. 用户列表搜索同时匹配 username 和 email
7. 新增 `/api/user/me` 接口获取当前登录用户信息
8. 新增个人设置页面（`/console/settings`），所有登录用户可访问
9. 个人设置保存后同步更新 authStore
10. 种子数据：admin email 为 `chenjy@chenjy.cn`

## 数据字段

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| email | TEXT | NOT NULL, UNIQUE | 用户邮箱 |

## username 校验规则

- 正则：`/^[a-zA-Z][a-zA-Z0-9]*$/`
- 含义：英文字母开头，后续只能是英文字母或数字
- 前端：zod schema 校验
- 后端：API 层正则校验
