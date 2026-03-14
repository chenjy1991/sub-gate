# 009 - 权限管理 - 执行记录

## 实际改动文件

### 后端修改
- `entity/SysPermission.java` — 新增 `parentId`、`sort` 字段
- `service/SysPermissionService.java` — 新增 `getTree()`、`getAncestorCodes()` 方法声明
- `service/impl/SysPermissionServiceImpl.java` — 实现 `getTree()`（查询所有权限按 parentId 组装树）和 `getAncestorCodes()`（根据按钮 code 向上追溯所有祖先菜单 code）
- `controller/PermissionController.java` — 新增 `POST /api/permission/tree` 接口
- `controller/AuthController.java` — 注入 `SysPermissionService`，login 返回 permissions 时调用 `getAncestorCodes()` 补充祖先菜单 code
- `controller/RoleController.java` — 新增 `POST /api/role/getPermissionIds` 接口
- `mapper/SysUserMapper.java` — 新增 `selectPermissionCodesByUserId` SQL
- `service/SysUserService.java` + `impl/SysUserServiceImpl.java` — 新增 `getPermissionCodes` 方法
- `resources/db/init.sql` — `sys_permission` 表新增 `parent_id`、`sort` 列，`type` 值改为 `menu`/`button`，种子数据改为树形结构（固定 ID 100001-100051）

### 前端修改
- `services/permissions.ts` — 类型新增 `parentId`、`sort`，新增 `PermissionTreeNode` 接口和 `getPermissionTree()` 函数
- `pages/permissions/PermissionListPage.tsx` — 完全重写为左右分栏（左侧树形菜单，右侧按钮权限表格）
- `pages/roles/RoleListPage.tsx` — 分配权限 Dialog 改为树形勾选（支持级联全选/半选/取消）
- `components/layout/Sidebar.tsx` — 菜单 permission 映射改为二级菜单 code（如 `system:user`、`service:node`）
- `lib/permission.ts` — `hasPermission` 增加 `permissions` 为 undefined 的防御性判断
- `types/index.ts` — `AuthUser` 新增 `permissions: string[]`

### 前端新增
- `lib/permission.ts` — `hasPermission(code)` 工具函数
- `services/roles.ts` — 新增 `getPermissionIds`、`assignPermissions`

## 设计决策

1. 采用方案C：只用 `sys_permission` 表，通过 `parent_id` + `type`（menu/button）统一管理树形权限，不引入新表
2. 种子数据使用固定 ID（100001-100051），避免与雪花算法生成的 ID 冲突
3. 登录时 permissions 列表包含按钮 code + 所有祖先菜单 code，前端侧边栏用二级菜单 code 判断可见性
4. ADMIN 角色返回 `["*"]` 表示拥有所有权限
5. 不做接口级权限校验，只做前端菜单/按钮级控制
6. 权限管理页面左右分栏：左侧 280px 树形菜单（支持展开/折叠、hover 操作），右侧按钮权限表格
7. 角色分配权限 Dialog 改为树形勾选，支持父子级联（全选/半选/取消）

## 数据库操作

删除 `backend/data/admin.db` 重建，通过 API 恢复了 2 个节点和 1 个订阅（自建，关联 2 节点 + 3 角色 + admin 用户）。
