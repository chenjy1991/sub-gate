# 订阅管理 — 计划

## 数据模型
- `sys_subscription` 表：id, name, remark, status
- `sys_subscription_node` 关联表：subscription_id, node_id
- `sys_subscription_role` 关联表：subscription_id, role_id
- `sys_subscription_user` 关联表：subscription_id, user_id

## 后端接口
| 路径 | 说明 |
|------|------|
| `POST /api/subscription/list` | 分页列表 |
| `POST /api/subscription/getById` | 获取单个（含 nodeIds/roleIds/userIds） |
| `POST /api/subscription/detail` | 详情（含完整 nodes 列表 + roleIds/userIds） |
| `POST /api/subscription/create` | 新增（含 nodeIds） |
| `POST /api/subscription/update` | 编辑（含 nodeIds） |
| `POST /api/subscription/delete` | 删除 |
| `POST /api/subscription/assignRoles` | 分配角色 |
| `POST /api/subscription/assignUsers` | 分配用户 |

## Mapper 关联操作
- 3 组关联表（node/role/user），每组 insert/delete/select 三个方法
- 使用 `@Insert`/`@Delete`/`@Select` 注解内联 SQL
- `INSERT OR IGNORE INTO` 防重复

## Service 层
- assignNodes/assignRoles/assignUsers 均加 `@Transactional`，先删后插
- getNodeIds/getRoleIds/getUserIds 查询关联 ID 列表

## 前端页面
- `/subscriptions` — SubscriptionListPage（列表 + 搜索 + 删除）
- `/subscriptions/new` — SubscriptionFormPage（名称/备注/状态 + 节点多选）
- `/subscriptions/:id/edit` — SubscriptionFormPage 复用
- `/subscriptions/:id` — SubscriptionDetailPage（节点列表 + 角色分配弹窗 + 用户分配弹窗）

## 涉及文件
### 后端（新增 4 个）
- `entity/SysSubscription.java`
- `mapper/SysSubscriptionMapper.java`（含 9 个关联表注解方法）
- `service/SysSubscriptionService.java`
- `service/impl/SysSubscriptionServiceImpl.java`
- `controller/SubscriptionController.java`

### 前端（新增 4 个）
- `services/subscriptions.ts`
- `pages/subscriptions/SubscriptionListPage.tsx`
- `pages/subscriptions/SubscriptionFormPage.tsx`
- `pages/subscriptions/SubscriptionDetailPage.tsx`

### 数据库
- `db/init.sql` — 新增 4 张表建表语句
