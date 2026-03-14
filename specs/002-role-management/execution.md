# 角色管理 — 执行记录

## 实际改动

### 后端
- `db/init.sql` — 角色种子数据替换为 ADMIN/VIP/USER，加兼容旧数据的 UPDATE 语句
- `AuthController.java` — 登录角色映射改为 ADMIN->admin, VIP->vip, 默认->user
- 已有数据库 `admin.db` 同步更新角色数据（调整 id 顺序：1=ADMIN, 2=VIP, 3=USER）

### 前端
- `types/index.ts` — User.role 改为 'admin' | 'vip' | 'user'，Role 接口对齐后端字段，PageResult 去掉后端不返回的 page/pageSize
- `services/roles.ts` — 从 mock 改为调用真实 API
- `pages/roles/RoleListPage.tsx` — 完整重写，Dialog 弹窗新增/编辑 + 确认删除
- `pages/users/UserListPage.tsx` — roleLabels 更新
- `pages/users/UserFormPage.tsx` — 角色下拉选项和默认值更新
- `components/common/PermGuard.tsx` — roles 类型更新
- `mock/data/users.ts` — mock 用户角色值同步更新
- `mock/data/roles.ts` — 已删除

## 遇到的问题
- 已有数据库中旧 USER 角色占了 id=2，需要先迁移到 id=3 再插入 VIP(id=2)
