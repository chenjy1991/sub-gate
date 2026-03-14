# 009 - 权限管理

## 需求背景

当前系统所有登录用户都能访问所有页面和功能，缺乏权限控制。需要实现树形菜单-按钮结构的权限管理，让不同角色的用户只能看到和操作自己有权限的功能。

## 功能列表

### 1. 权限数据模型（树形结构）

`sys_permission` 表支持树形结构，通过 `parent_id` 形成父子关系，`type` 区分菜单和按钮：

```
一级菜单 (type=menu, parent_id=0)
├── 二级菜单 (type=menu)
│   ├── 按钮权限1 (type=button)
│   ├── 按钮权限2 (type=button)
│   └── ...
```

### 2. 权限管理页面（左右分栏）

**左侧 - 树形菜单：**
- 展示所有 type=menu 的权限节点，形成两级树
- 一级菜单可展开/折叠
- 支持新增一级菜单、新增子菜单、编辑、删除
- 点击菜单节点，右侧显示对应内容

**右侧 - 按钮权限列表：**
- 选中二级菜单时，展示该菜单下的 type=button 权限列表
- 支持新增、编辑、删除按钮权限

### 3. 角色分配权限（树形勾选）

- 角色列表页「分配权限」按钮弹出 Dialog
- 展示完整权限树，支持勾选/取消
- 级联逻辑：勾选父节点自动勾选所有子节点，取消同理
- 子节点部分勾选时父节点显示半选状态

### 4. 前端菜单/按钮级权限控制

- 登录接口返回当前用户的权限码列表（包含菜单 code 和按钮 code）
- ADMIN 角色返回 `["*"]`
- 侧边栏菜单根据二级菜单 code 控制可见性

### 5. 权限树结构定义

```
系统管理 (code=system)
├── 用户管理 (code=system:user)
│   ├── 查看用户 (code=user:list)
│   ├── 创建用户 (code=user:create)
│   ├── 编辑用户 (code=user:update)
│   └── 删除用户 (code=user:delete)
├── 角色管理 (code=system:role)
│   └── 角色管理 (code=role:manage)
├── 权限管理 (code=system:permission)
│   └── 权限管理 (code=permission:manage)
订阅服务 (code=service)
├── 节点配置 (code=service:node)
│   └── 节点管理 (code=node:manage)
├── 订阅管理 (code=service:subscription)
│   └── 订阅管理 (code=subscription:manage)
```

### 6. 菜单与权限码映射

| 侧边栏菜单 | 所需权限 code |
|------------|--------------|
| 数据看板 | 无（登录即可） |
| 我的订阅 | 无（登录即可） |
| 用户管理 | `system:user` |
| 角色管理 | `system:role` |
| 权限管理 | `system:permission` |
| 节点配置 | `service:node` |
| 订阅管理 | `service:subscription` |

## 不包含

- 接口级权限校验（AuthInterceptor 不做改动）
