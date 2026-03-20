# 016 - 数据看板真实数据化 - 实施计划

## 实施原则

1. 先补数据模型，再接入数据写入，最后改 dashboard 查询与前端页面
2. 所有历史指标从本次改造上线时开始累计，不伪造过去数据
3. 业务启用状态与运行检测状态分离，`status` 继续表示业务启用/禁用
4. 新增时间字段沿用当前项目的文本时间方案，统一为 `YYYY-MM-DD HH:mm:ss`
5. dashboard 聚合按自然日统计，缺失日期由服务端补 0
6. 每完成一个阶段后执行 `pnpm build` 验证

## 数据模型设计

### 一、现有表扩展

#### `sys_user`

新增字段：

1. `updatedAt`
2. `activatedAt`
3. `lastLoginAt`

用途：

1. `updatedAt` 统一用户资料更新时间语义
2. `activatedAt` 为激活相关统计预留基础
3. `lastLoginAt` 用于快速判断最近登录情况，并为列表页等后续功能复用

#### `sys_role`

新增字段：

1. `createdAt`
2. `updatedAt`

用途：

1. 统一后台核心实体时间字段风格
2. 为后续角色相关统计或审计提供基础

#### `sys_permission`

新增字段：

1. `createdAt`
2. `updatedAt`

用途：

1. 保持系统管理核心实体时间字段一致性

#### `sys_node`

新增字段：

1. `createdAt`
2. `updatedAt`
3. `lastCheckedAt`
4. `lastCheckStatus`
5. `lastCheckLatency`

用途：

1. `createdAt` / `updatedAt` 支撑节点新增趋势与维护时间
2. `lastCheckedAt` / `lastCheckStatus` / `lastCheckLatency` 用于快速展示最近一次检测快照
3. 节点可用性历史通过独立日志表记录，不与业务状态字段混用

#### `sys_subscription`

新增字段：

1. `createdAt`
2. `updatedAt`

用途：

1. 支撑订阅新增趋势与后续 dashboard 扩展

### 二、新增历史表

#### `sys_login_log`

字段建议：

1. `id`
2. `userId`
3. `ip`
4. `userAgent`
5. `createdAt`

用途：

1. 统计今日登录次数
2. 统计近 7 天活跃用户数
3. 绘制每日登录趋势

索引建议：

1. `user_id`
2. `created_at`

#### `sys_node_check_log`

字段建议：

1. `id`
2. `nodeId`
3. `isReachable`
4. `latency`
5. `createdAt`

用途：

1. 记录每次节点检测结果
2. 支撑节点可用率趋势与最近检测明细

索引建议：

1. `node_id`
2. `created_at`

#### `sys_subscription_access_log`

字段建议：

1. `id`
2. `subscriptionId`
3. `userId`
4. `accessType`
5. `ip`
6. `userAgent`
7. `createdAt`

用途：

1. 记录外部订阅链接下发次数
2. 支撑订阅使用趋势、最近访问统计等后续 dashboard 指标

索引建议：

1. `subscription_id`
2. `user_id`
3. `created_at`

### 三、Migration 策略

1. 使用 Drizzle migration 管理字段新增与历史表创建
2. 现有 `sys_user.createdAt` 保持原样，不做格式改造
3. 新增到旧表的时间字段为已有记录补当前时间默认值，避免出现大量空值
4. 历史表不回填旧数据，从 migration 生效后开始记录
5. 日级聚合优先使用字符串前 10 位日期部分，避免 SQLite 时间解析差异带来偏差

## 数据采集链路设计

### 四、登录链路

改造文件：

- `app/api/auth/login/route.ts`

计划：

1. 登录成功后更新 `sys_user.lastLoginAt`
2. 登录成功后写入 `sys_login_log`
3. 登录主流程成功优先，登录日志写入失败不应导致登录整体失败

采集内容：

1. 用户 ID
2. 请求 IP
3. User-Agent
4. 登录时间

### 五、节点检测链路

改造文件：

- `app/api/node/check/route.ts`

计划：

1. 节点检测完成后写入 `sys_node_check_log`
2. 同步更新 `sys_node.lastCheckedAt`
3. 同步更新 `sys_node.lastCheckStatus`
4. 同步更新 `sys_node.lastCheckLatency`
5. 检测结果返回优先，历史写入失败不应吞掉检测结果

### 六、订阅访问链路

改造文件：

- `app/api/subscribe/[token]/route.ts`

计划：

1. 订阅鉴权通过且内容生成成功后写入 `sys_subscription_access_log`
2. 记录订阅 ID、用户 ID、请求类型、IP、User-Agent、访问时间
3. 订阅内容下发优先，访问日志写入失败不应阻断订阅返回

## Dashboard 接口与查询设计

### 七、Dashboard 统计接口

新增接口：

- `POST /api/dashboard/overview`

权限：

1. 使用现有 `dashboard` 权限码校验

返回结构建议：

1. `stats`
2. `userGrowthTrend`
3. `loginTrend`

其中：

1. `stats.totalUsers` = 用户总数
2. `stats.activeUsers` = 近 7 天有成功登录记录的去重用户数
3. `stats.totalRoles` = 角色总数
4. `stats.todayLogins` = 今日成功登录次数
5. `userGrowthTrend` = 最近 7 天或 30 天用户新增数
6. `loginTrend` = 最近 7 天或 30 天登录次数

查询实现建议：

1. 总量卡片使用单表计数或简单聚合
2. 趋势图按天聚合后由服务端补齐缺失日期
3. 历史为空时返回补零后的空趋势，不报错

建议新增查询封装：

- `lib/dashboard.ts`

用途：

1. 集中维护 dashboard 聚合查询逻辑
2. 避免 Route Handler 内出现大量统计 SQL 与日期补零逻辑

## 前端页面规划

### 八、页面与服务层

改造文件：

- `services/dashboard.ts`
- `app/console/dashboard/page.tsx`
- `types/index.ts`

计划：

1. 前端改为请求真实 dashboard 接口
2. 页面保留“4 张卡片 + 2 张图表”的基础布局
3. `活跃用户` 明确定义为“近 7 天有登录记录的用户数”
4. 页面增加真实请求下的加载态、错误态与空数据兜底
5. 优先改为单次请求获取 dashboard 全量数据，减少多次往返

类型调整建议：

1. 保留 `DashboardStats`
2. 新增 `DashboardOverview`
3. 统一 `ChartDataPoint` 用于图表序列

## 涉及文件清单

### 重点修改

- `lib/db/schema.ts`
- `app/api/auth/login/route.ts`
- `app/api/node/check/route.ts`
- `app/api/subscribe/[token]/route.ts`
- `services/dashboard.ts`
- `app/console/dashboard/page.tsx`
- `types/index.ts`
- `AGENTS.md`

### 重点新增

- `app/api/dashboard/overview/route.ts`
- `lib/dashboard.ts`
- `drizzle/*` 中对应 migration 文件

## 分阶段执行清单

### 第一阶段：数据库与迁移

1. 扩展核心表字段
2. 创建三张历史表
3. 补齐索引与外键
4. 验证 migration 可执行

### 第二阶段：数据采集接入

1. 登录成功写入登录历史
2. 节点检测写入检测历史并更新快照
3. 订阅下发写入访问历史

### 第三阶段：Dashboard 真数据落地

1. 实现 dashboard 聚合查询
2. 新增 dashboard 接口
3. 改造前端服务层
4. 改造 dashboard 页面
5. 执行 `pnpm build`

## 风险与控制

1. 现有时间字段为文本格式，聚合逻辑需统一按字符串日期截取处理
2. 历史数据从本次改造开始累计，初期趋势图数据点偏少属于预期行为
3. 公共订阅链接是高频路径，日志写入必须采用失败可降级策略，避免影响内容下发
4. 节点检测接口既有业务状态又有检测状态，必须避免字段语义混淆
