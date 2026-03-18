# 011 - 状态切换功能 — 执行记录

## 改动文件

| 文件 | 改动说明 |
|------|---------|
| `app/console/nodes/page.tsx` | 状态列 Badge 改为可点击切换，新增 `togglingId` state 和 `handleToggleStatus` 函数 |
| `app/console/subscriptions/page.tsx` | 同上，状态列 Badge 可点击切换 |
| `services/nodes.ts` | `updateNode` 参数类型从 `ProxyNode` 改为 `Partial<ProxyNode> & { id: string }`，支持部分字段更新 |

## 设计决策

- `updateNode` 的参数类型原来要求完整的 `ProxyNode`，但后端 API 实际支持部分字段更新，因此放宽为 `Partial<ProxyNode> & { id: string }`
- `updateSubscription` 的参数类型本身已是可选字段，无需修改
- 切换期间通过 `togglingId` 控制 loading 态和防重复点击，无需额外引入 loading 组件

## 验证

- `pnpm build` 通过，无类型错误
