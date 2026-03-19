# 015 - 项目加固与工程化优化 - 实施计划

## 实施原则

1. 严格按 P0 → P1 → P2 顺序执行
2. 优先修改公共能力，再批量收口业务接口
3. 每完成一个阶段后执行 `pnpm build` 验证
4. 涉及行为变化的改动必须先统一规则，再逐文件落地

## 模块拆分

### 一、权限与鉴权层

目标：将“是否允许访问/操作”从前端提示提升为后端强校验。

计划：
1. 抽统一鉴权工具，统一 token 获取、用户身份解析和异常处理
2. 抽统一授权工具，支持校验是否具备某个权限码
3. 为写操作接口补齐权限校验
4. 为关键读操作接口补齐最小权限校验
5. 收紧公开路径白名单

设计要点：
1. `middleware.ts` 负责登录态拦截
2. Route Handler 内通过公共工具获取当前用户并校验权限
3. 未登录返回 401，已登录但无权限返回统一业务错误

## 接口改造策略

### 二、API 入参校验

目标：统一 Route Handler 的 `request.json()` 解析、schema 校验和错误消息。

计划：
1. 抽通用 body 解析与 Zod 校验工具
2. 为认证、用户、角色、权限、节点、订阅、配置相关接口逐步接入 schema
3. 统一参数缺失、类型错误、格式错误时的返回结构

设计要点：
1. schema 定义与接口同模块放置，避免过度集中
2. 校验失败统一返回中文可读消息
3. 数值型 ID 在接口边界完成转换与收敛

### 三、注册与邮件流程

目标：明确注册成功、待激活、邮件失败等状态语义。

计划：
1. 梳理当前注册流程的状态变化
2. 明确“创建用户成功但发送邮件失败”的业务处理规则
3. 根据规则补充接口返回与页面提示

候选方案：
1. 保留用户记录，提示稍后重发激活邮件
2. 使用事务回滚用户创建

默认采用：
1. 保留用户记录并提示重发，避免用户重复注册造成歧义

## 数据模型与数据库计划

### 四、数据库约束与演进

目标：让 Drizzle schema 成为唯一可信的数据结构来源。

计划：
1. 盘点现有表的外键、索引、唯一性约束
2. 将建表逻辑从 `seed.ts` 中拆出，改为 migration 管理
3. 收敛 seed 为“初始化角色、权限、管理员、基础配置”

重点关注表：
1. `sys_user`
2. `sys_role`
3. `sys_permission`
4. `sys_user_role`
5. `sys_role_permission`
6. `sys_subscription`
7. `sys_subscription_node`
8. `sys_subscription_role`
9. `sys_subscription_user`
10. `sys_config`

### 五、类型收敛

目标：统一数据库、接口 DTO、前端展示层的类型边界。

计划：
1. 识别当前 `id: string` 与数据库 `id: number` 的漂移点
2. 统一接口输入输出的 ID 表示
3. 清理无效或过时的类型定义

设计要点：
1. 数据库存储层保持数值主键
2. 接口层明确转换策略
3. 前端类型与服务端返回结构保持一致

## 性能优化计划

### 六、核心查询优化

目标：消除典型 N+1 和全表加载后内存过滤。

优先接口：
1. `POST /api/user/list`
2. `POST /api/auth/login`
3. `POST /api/subscription/detail`
4. 其他存在关联表循环查询的接口

优化方向：
1. 使用 join / 聚合替代逐条查角色
2. 避免加载整表后在内存中过滤
3. 为常用过滤字段补索引设计

## 页面规划

本次优化不新增业务页面，页面侧仅做以下必要调整：

1. 根据新的接口返回与错误消息调整现有交互
2. 必要时更新登录、注册、系统配置等页面的提示文案
3. 保持现有路由结构不变

## 工程化计划

### 七、测试与规范

计划：
1. 建立最小测试框架
2. 优先覆盖认证、权限、节点解析、订阅生成
3. 增加 lint / format 能力
4. 为常见公共逻辑建立可复用测试样例

### 八、文档清账

计划：
1. 更新 AGENTS 中的 API 数量、目录描述和已有功能列表
2. 为缺失的 spec 补齐 execution.md
3. 处理已有 spec 编号冲突与记录不一致问题

## 涉及文件清单

### 重点修改

- middleware.ts
- lib/auth.ts
- lib/result.ts
- lib/request.ts
- lib/db/schema.ts
- lib/db/seed.ts
- lib/mail.ts
- types/index.ts
- app/api/auth/login/route.ts
- app/api/auth/register/route.ts
- app/api/auth/resend-activation/route.ts
- app/api/user/list/route.ts
- app/api/user/create/route.ts
- app/api/user/update/route.ts
- app/api/user/delete/route.ts
- app/api/role/*
- app/api/permission/*
- app/api/node/*
- app/api/subscription/*
- app/api/config/*
- services/*
- app/login/page.tsx
- app/register/page.tsx
- app/console/mail/page.tsx
- AGENTS.md

### 可能新增

- lib/api/
- lib/validation/
- 测试相关目录与配置文件
- migration 相关目录与配置文件

## 分阶段执行清单

### 第一阶段：P0

1. 建立统一鉴权/授权工具
2. 建立统一 Zod 校验工具
3. 按模块为 API 接入权限校验与参数校验
4. 收敛 JWT Secret 配置
5. 修正注册流程状态处理

### 第二阶段：P1

1. 重写用户列表查询
2. 重写登录权限加载逻辑
3. 优化订阅详情等多表查询
4. 统一类型边界
5. 收敛系统配置读取

### 第三阶段：P2

1. 建立 migration
2. 收敛 seed
3. 引入测试框架与基础用例
4. 引入 lint / format
5. 清理 AGENTS 与 specs 文档

## 风险与控制

1. 权限校验补齐后，可能暴露现有接口与页面权限码不一致的问题
2. 类型收敛会影响前后端多个文件，需分批提交并持续构建验证
3. migration 引入后需确保现有 SQLite 数据兼容升级
4. 文档清账可能涉及历史 spec 编号冲突，需要保留变更说明
