# 订阅管理 — 需求

## 背景
将节点组织为订阅，并控制哪些角色和用户可以访问特定订阅。

## 功能需求
1. 订阅列表（分页）
2. 新增订阅（名称、备注、状态、关联节点多选）
3. 编辑订阅
4. 删除订阅
5. 订阅详情页：展示关联节点列表、分配角色、分配用户
6. 角色分配：弹窗多选角色，保存关联
7. 用户分配：弹窗多选用户，保存关联

## 数据模型
- `sys_subscription` — id, name, remark, status
- `sys_subscription_node` — subscription_id, node_id（多对多）
- `sys_subscription_role` — subscription_id, role_id（多对多）
- `sys_subscription_user` — subscription_id, user_id（多对多）

## 关联关系
- 一个订阅可关联多个节点
- 一个订阅可分配给多个角色
- 一个订阅可分配给多个用户
