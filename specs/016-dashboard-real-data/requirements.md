# 016 - 数据看板真实数据化

## 需求背景

当前 `/console/dashboard` 页面通过 `services/dashboard.ts` 返回 mock 数据，卡片与图表都不反映真实业务状态。

现有数据库只能支撑少量静态汇总：`sys_user` 已有 `createdAt`，但缺少登录历史、节点检测历史、订阅访问历史等数据采集能力。如果直接把 mock 替换为 SQL，只能得到不完整甚至失真的看板结果。

项目目前尚未正式上线，因此本次改造允许“历史数据从改造上线当天开始积累”，不要求补算过去不存在的历史。

## 改造目标

1. 用真实数据库数据替换 dashboard mock
2. 在不伪造历史数据的前提下，保留现有看板卡片与图表能力
3. 补齐支撑 dashboard 的最小数据模型与采集链路
4. 让后续节点可用率趋势、订阅访问趋势具备可扩展的数据基础

## 功能列表

### P0 - 看板真实数据化

1. 新增 dashboard 统计接口，返回真实统计卡片与图表数据
2. `services/dashboard.ts` 改为调用真实接口，移除前端 mock 与模拟延时
3. `/console/dashboard` 页面保留现有主布局，接入真实加载、空状态与错误状态
4. 所有展示数据必须来自数据库真实查询，不允许保留硬编码数字

### P1 - 数据模型补齐

1. 为 dashboard 相关核心表补齐必要时间字段
2. 为用户成功登录新增登录历史记录
3. 为节点检测新增检测历史记录与最新检测快照字段
4. 为订阅外链访问新增访问历史记录
5. 历史类数据从本次改造落地后开始累计，不补造旧数据

### P2 - 数据采集接入

1. 成功登录时写入登录历史，并更新用户最近登录时间
2. 执行节点检测时写入检测历史，并回写节点最新检测结果
3. 外部访问订阅链接时写入访问历史
4. dashboard 查询支持按天聚合最近 7 天或 30 天数据

## 首版 Dashboard 指标范围

### 卡片

1. 总用户数
2. 近 7 天活跃用户数
3. 角色总数
4. 今日登录次数

### 图表

1. 用户增长趋势
   - 基于 `sys_user.createdAt` 按天统计
2. 每日登录次数
   - 基于登录历史按天统计

### 本期同步落地但首版可先不展示的统计基础

1. 节点最近检测结果与检测历史
2. 订阅访问历史
3. 后续扩展节点可用率趋势、订阅访问趋势所需的数据基础

## 验收标准

1. dashboard 页面不再依赖 mock 数据或前端模拟延时
2. 卡片数据可通过数据库当前数据直接复核
3. 用户增长趋势可由 `sys_user.createdAt` 真实聚合得到
4. 每日登录图表可由登录历史真实聚合得到
5. 历史表为空时，dashboard 页面仍能正常展示 0 值或空图表
6. 不伪造节点、登录、订阅的历史数据
7. dashboard 相关接口受现有 `dashboard` 权限控制

## 非目标

1. 不补算改造前不存在的历史趋势
2. 不重做 dashboard 的整体视觉设计
3. 不引入定时任务、消息队列或独立统计服务
4. 不把所有潜在运营指标一次性做完

## 涉及数据与表

### 现有表

- `sys_user`
- `sys_role`
- `sys_permission`
- `sys_node`
- `sys_subscription`

### 计划扩展字段

- `sys_user.updatedAt`
- `sys_user.activatedAt`
- `sys_user.lastLoginAt`
- `sys_role.createdAt`
- `sys_role.updatedAt`
- `sys_permission.createdAt`
- `sys_permission.updatedAt`
- `sys_node.createdAt`
- `sys_node.updatedAt`
- `sys_node.lastCheckedAt`
- `sys_node.lastCheckStatus`
- `sys_node.lastCheckLatency`
- `sys_subscription.createdAt`
- `sys_subscription.updatedAt`

### 计划新增历史表

- `sys_login_log`
- `sys_node_check_log`
- `sys_subscription_access_log`

## 执行顺序

1. 设计并落地 migration，补齐字段与历史表
2. 接入登录、节点检测、订阅访问的数据采集
3. 新增 dashboard 真实统计接口
4. 改造前端 dashboard 页面和服务层
