# 用户管理 — 计划

## 数据模型
- `sys_user` 表：id, username, password(BCrypt), nickname, status, created_at
- `sys_user_role` 关联表：user_id, role_id
- 后端 UserVO 返回 roleCodes 数组，不暴露密码

## 后端接口
| 路径 | 说明 |
|------|------|
| `POST /api/user/list` | 分页列表（返回 UserVO 含 roleCodes） |
| `POST /api/user/getById` | 获取单个用户（含 roleCodes） |
| `POST /api/user/create` | 新增（BCrypt 加密 + 角色分配） |
| `POST /api/user/update` | 编辑（密码留空不修改 + 角色变更） |
| `POST /api/user/delete` | 删除 |

## 前端页面
- `/users` — UserListPage，分页表格 + 搜索 + 删除确认
- `/users/new` — UserFormPage，Card 表单（含密码字段 + 角色下拉）
- `/users/:id/edit` — UserFormPage 复用

## 前端类型拆分
- `AuthUser` — 登录用户（authStore 使用，含单值 role）
- `User` — 用户管理列表（对齐后端 UserVO，含 roleCodes 数组）

## 涉及文件
### 后端
- `controller/UserController.java`（重写）
- `service/SysUserService.java`

### 前端
- `src/types/index.ts`（AuthUser + User 拆分）
- `src/services/users.ts`（从 mock 改为真实 API）
- `src/pages/users/UserListPage.tsx`（重写）
- `src/pages/users/UserFormPage.tsx`（重写）
- `src/store/authStore.ts`（改用 AuthUser）
- `src/services/auth.ts`（改用 AuthUser）
