# 008 - 我的订阅 - 执行记录

## 实际改动文件

### 后端修改
- `entity/SysUser.java` — IdType.AUTO → IdType.ASSIGN_ID
- `entity/SysRole.java` — 同上
- `entity/SysPermission.java` — 同上
- `entity/SysMenu.java` — 同上
- `entity/SysNode.java` — 同上
- `entity/SysSubscription.java` — 同上
- `resources/db/init.sql` — 所有表去掉 AUTOINCREMENT
- `config/AuthInterceptor.java` — 校验通过后将 userId 存入 request.setAttribute
- `config/WebMvcConfig.java` — 排除 `/api/subscribe/**` 路径
- `mapper/SysSubscriptionMapper.java` — 新增 selectSubscriptionIdsByUserId、selectSubscriptionIdsByRoleIds、countBySubIdAndUserId、countBySubIdAndRoleIds
- `service/SysSubscriptionService.java` — 新增 getSubscriptionsByUserId、hasAccess 方法声明
- `service/impl/SysSubscriptionServiceImpl.java` — 实现上述两个方法
- `service/SysNodeService.java` — 新增 generateBase64、generateClash、generateSurge、generateQuantumultX 方法声明
- `service/impl/SysNodeServiceImpl.java` — 实现 4 种客户端配置生成

### 后端新增
- `controller/MySubscriptionController.java` — /api/my-subscription/list、/api/my-subscription/detail
- `controller/SubscribeController.java` — GET /api/subscribe/{token}?type=xxx 公开接口

### 前端修改
- `router/index.tsx` — 新增 /my-subscriptions 路由
- `components/layout/Sidebar.tsx` — 新增「我的订阅」菜单项（Star 图标）

### 前端新增
- `services/mySubscriptions.ts` — getMySubscriptions、getMySubscriptionDetail
- `pages/my-subscriptions/MySubscriptionPage.tsx` — 左右分栏页面

## 设计决策

1. 订阅 token 采用 `Base64Url(userId:subscriptionId)` 方案，不存数据库，实时校验权限关系
2. 所有表主键改为雪花算法（ASSIGN_ID），防止 ID 被遍历猜测
3. AuthInterceptor 改造为将 userId 存入 request attribute，供 Controller 获取当前用户
4. 订阅公开接口使用 GET 方法 + ResponseEntity 返回，不走 Result 包装，方便客户端直接拉取
5. 节点可用性检测在切换订阅时自动触发，并行检测所有节点，无手动检测按钮
6. 未引入 Tooltip 组件，使用原生 title 属性替代

## 注意事项

- 雪花算法改造后，已有的自增 ID 数据需要清库重建（删除 SQLite 数据库文件后重启）
- SubscribeController 的 GET 接口不走 AuthInterceptor，通过 token 解析 + 实时权限校验保证安全
