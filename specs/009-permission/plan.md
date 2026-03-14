# 009 - 权限管理 - 实施计划

## 数据模型改动

### sys_permission 表改造

```sql
CREATE TABLE IF NOT EXISTS sys_permission (
    id        INTEGER PRIMARY KEY,
    parent_id INTEGER NOT NULL DEFAULT 0,
    name      TEXT NOT NULL,
    code      TEXT NOT NULL UNIQUE,
    type      TEXT NOT NULL DEFAULT 'menu',  -- menu / button
    sort      INTEGER NOT NULL DEFAULT 0,
    remark    TEXT
);
```

新增字段：`parent_id`（父级 ID，0=顶级）、`sort`（排序）。`type` 值从 `api` 改为 `menu` / `button`。

### 种子数据（固定 ID，避免与雪花 ID 冲突）

见 requirements.md 中的权限树结构定义，使用 100001-100051 范围的固定 ID。

## 接口设计

### 新增接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/permission/tree` | POST | 返回完整权限树 |

### 改动接口

| 接口 | 改动 |
|------|------|
| `/api/permission/create` | 请求体新增 parentId、sort |
| `/api/permission/update` | 请求体新增 parentId、sort |
| `/api/auth/login` | permissions 列表补充祖先菜单 code |

## 页面规划

### PermissionListPage.tsx（左右分栏）

**左侧（280px）：** 树形菜单，一级可展开/折叠，支持新增/编辑/删除菜单节点
**右侧（flex-1）：** 选中二级菜单后展示按钮权限表格，支持新增/编辑/删除

### RoleListPage.tsx 分配权限 Dialog 改造

树形勾选，支持级联选择（全选/半选/取消），Dialog 加大到 max-w-2xl

## 涉及文件清单

### 后端修改
- `entity/SysPermission.java` — 新增 parentId、sort
- `controller/PermissionController.java` — 新增 tree 接口
- `service/SysPermissionService.java` — 新增 getTree()
- `service/impl/SysPermissionServiceImpl.java` — 实现 getTree()
- `controller/AuthController.java` — login permissions 补充祖先 code
- `resources/db/init.sql` — 表结构 + 种子数据改造

### 前端修改
- `services/permissions.ts` — 类型和接口适配
- `pages/permissions/PermissionListPage.tsx` — 完全重写
- `pages/roles/RoleListPage.tsx` — 分配权限 Dialog 改造
- `components/layout/Sidebar.tsx` — 菜单 permission 映射调整
