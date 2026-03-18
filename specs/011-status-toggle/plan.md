# 011 - 状态切换功能 — 实现计划

## 后端

无需改动。节点和订阅的 update 接口均已支持单独更新 `status` 字段。

## 前端

### 涉及文件

| 文件 | 改动 |
|------|------|
| `app/console/nodes/page.tsx` | 状态列 Badge 改为可点击，点击调用 `updateNode({ id, status })` 切换 |
| `app/console/subscriptions/page.tsx` | 状态列 Badge 改为可点击，点击调用 `updateSubscription({ id, status })` 切换 |

### 实现细节

1. 新增 `togglingId` state（`string | null`），记录当前正在切换状态的行 ID
2. 新增 `handleToggleStatus(id, currentStatus)` 函数：
   - 设置 `togglingId` 为当前行 ID
   - 调用 update 接口，传 `{ id, status: currentStatus === 1 ? 0 : 1 }`
   - 成功后调用 `fetchList()` 刷新数据
   - 最终清除 `togglingId`
3. Badge 添加 `cursor-pointer` 样式和 `onClick` 事件
4. 当 `togglingId === 当前行ID` 时，Badge 显示为 loading/disabled 态
