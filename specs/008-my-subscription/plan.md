# 008 - 我的订阅 - 实施计划

## 数据模型改动

### 主键改造
- 所有 Entity 的 `@TableId(type = IdType.AUTO)` → `@TableId(type = IdType.ASSIGN_ID)`
- init.sql 建表语句去掉 `AUTOINCREMENT`
- 涉及 Entity：SysUser、SysRole、SysPermission、SysMenu、SysNode、SysSubscription

### 无新增表/字段

token 由 `Base64Url(userId + ":" + subscriptionId)` 动态生成，不需要数据库存储。

## 接口设计

### 新增接口

| 接口 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/my-subscription/list` | POST | 需要 token | 获取当前用户可见的订阅列表 |
| `/api/my-subscription/detail` | POST | 需要 token | 获取某个订阅的节点列表（校验权限） |
| `/api/subscribe/{token}` | GET | 无需认证 | 公开订阅接口，按客户端格式返回节点配置 |

### /api/my-subscription/list

请求体：无（通过 request attribute 获取 userId）

响应：
```json
{
  "code": 0,
  "data": [
    { "id": 1234567890, "name": "订阅名", "remark": "备注", "status": 1 }
  ]
}
```

### /api/my-subscription/detail

请求体：`{ "id": subscriptionId }`

响应：
```json
{
  "code": 0,
  "data": {
    "id": 1234567890,
    "name": "订阅名",
    "remark": "备注",
    "nodes": [ { "id": ..., "name": ..., "protocol": ..., ... } ]
  }
}
```

### GET /api/subscribe/{token}?type=base64

- 解析 token → userId + subscriptionId
- 校验用户存在且 status=1
- 校验订阅存在且 status=1
- 校验用户有权访问（sys_subscription_user 直接分配 或 sys_subscription_role + sys_user_role 间接分配）
- 根据 type 参数返回对应格式的节点配置

## 页面规划

### MySubscriptionPage.tsx（左右分栏）

**左侧面板（约 40% 宽度）：**
- 订阅卡片列表，选中态高亮
- 每个卡片：名称、备注
- 订阅链接区域：5 个客户端按钮（通用、Clash、Surge、Shadowrocket、Quantumult X），点击复制 URL

**右侧面板（约 60% 宽度）：**
- 未选中时显示提示文字
- 选中后展示节点表格：名称、协议、状态（绿色/红色圆点）
- 切换订阅时自动调用 `/api/node/check` 检测所有节点

## 涉及文件清单

### 后端修改
- `backend/src/main/java/com/admin/entity/SysUser.java` — IdType 改造
- `backend/src/main/java/com/admin/entity/SysRole.java` — IdType 改造
- `backend/src/main/java/com/admin/entity/SysPermission.java` — IdType 改造
- `backend/src/main/java/com/admin/entity/SysMenu.java` — IdType 改造
- `backend/src/main/java/com/admin/entity/SysNode.java` — IdType 改造
- `backend/src/main/java/com/admin/entity/SysSubscription.java` — IdType 改造
- `backend/src/main/java/com/admin/config/AuthInterceptor.java` — 传递 userId 到 request attribute
- `backend/src/main/java/com/admin/config/WebMvcConfig.java` — 排除 /api/subscribe 路径
- `backend/src/main/java/com/admin/mapper/SysSubscriptionMapper.java` — 新增查询方法
- `backend/src/main/java/com/admin/service/SysSubscriptionService.java` — 新增方法声明
- `backend/src/main/java/com/admin/service/impl/SysSubscriptionServiceImpl.java` — 新增方法实现
- `backend/src/main/java/com/admin/service/SysNodeService.java` — 新增批量生成配置方法
- `backend/src/main/java/com/admin/service/impl/SysNodeServiceImpl.java` — 新增配置生成实现
- `backend/src/main/resources/db/init.sql` — 去掉 AUTOINCREMENT

### 后端新增
- `backend/src/main/java/com/admin/controller/MySubscriptionController.java`
- `backend/src/main/java/com/admin/controller/SubscribeController.java`

### 前端修改
- `front/src/router/index.tsx` — 新增路由
- `front/src/components/layout/Sidebar.tsx` — 新增菜单项
- `front/src/types/index.ts` — 新增类型定义

### 前端新增
- `front/src/pages/my-subscriptions/MySubscriptionPage.tsx`
- `front/src/services/mySubscriptions.ts`
