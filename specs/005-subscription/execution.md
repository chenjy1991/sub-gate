# 订阅管理 — 执行记录

## 实际改动

### 后端
- `entity/SysSubscription.java` — 4 个字段：id, name, remark, status
- `mapper/SysSubscriptionMapper.java` — 继承 BaseMapper + 9 个注解方法（3 组 × insert/delete/select），操作 sys_subscription_node、sys_subscription_role、sys_subscription_user 三张关联表
- `service/SysSubscriptionService.java` — 接口声明 listPage + 6 个关联操作方法（assignNodes/getNodeIds/assignRoles/getRoleIds/assignUsers/getUserIds）
- `service/impl/SysSubscriptionServiceImpl.java` — 分页查询 + 关联操作实现，assign 方法加 @Transactional 先删后插
- `controller/SubscriptionController.java` — 8 个接口，getById 返回 nodeIds/roleIds/userIds，detail 返回完整 nodes 列表

### 前端
- `types/index.ts` — 新增 Subscription、SubscriptionDetail 接口
- `services/subscriptions.ts` — 8 个 API 函数（list/getById/detail/create/update/delete/assignRoles/assignUsers）
- `pages/subscriptions/SubscriptionListPage.tsx` — 列表页，分页 + 删除确认
- `pages/subscriptions/SubscriptionFormPage.tsx` — 表单页，新增/编辑复用，节点多选（从后端加载全部节点，Checkbox 列表勾选）
- `pages/subscriptions/SubscriptionDetailPage.tsx` — 详情页，展示关联节点列表 + 角色分配 Dialog + 用户分配 Dialog

### 数据库
- `db/init.sql` — 新增 4 张表：sys_subscription、sys_subscription_node、sys_subscription_role、sys_subscription_user

### 路由
- `router/index.tsx` — 新增 `/subscriptions`、`/subscriptions/new`、`/subscriptions/:id/edit`、`/subscriptions/:id` 四条路由

## 设计决策
1. getById vs detail — getById 返回 ID 列表（用于编辑表单回显），detail 返回完整对象（用于详情页展示）
2. 角色/用户分配放在详情页而非表单页 — 表单页只处理基本信息和节点关联，权限分配是独立操作
3. Mapper 用注解 SQL 而非 XML — 关联表操作简单，内联更直观

## 遇到的问题
无特殊问题。
