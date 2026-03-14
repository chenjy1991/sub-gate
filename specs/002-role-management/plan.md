# 角色管理 — 计划

## 数据模型
- `sys_role` 表：id, name, code(UNIQUE), remark, status
- 种子数据：ADMIN（管理员）、VIP（VIP用户）、USER（注册用户）

## 后端接口
| 路径 | 说明 |
|------|------|
| `POST /api/role/list` | 分页列表 |
| `POST /api/role/create` | 新增 |
| `POST /api/role/update` | 编辑 |
| `POST /api/role/delete` | 删除 |

## 前端页面
- `/roles` — RoleListPage，Dialog 弹窗表单（新增/编辑复用）+ 删除确认弹窗

## 涉及文件
### 后端
- `controller/RoleController.java`（已有）
- `db/init.sql`（替换角色种子数据）

### 前端
- `src/services/roles.ts`（从 mock 改为真实 API）
- `src/pages/roles/RoleListPage.tsx`（重写）
- `src/types/index.ts`（Role 接口对齐后端）
