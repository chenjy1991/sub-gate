# 节点可用性检测 — 计划

## 后端接口
| 路径 | 说明 |
|------|------|
| `POST /api/node/check` | 检测单个节点，请求 `{ id }`，返回 `{ reachable, latency }` |

## 实现方式
- 在 NodeController 中新增 check 接口
- 使用 `java.net.Socket` 连接 `node.address:node.port`，超时 5000ms
- 记录连接耗时作为 latency
- 异常时返回 reachable=false, latency=-1
- 逻辑直接写在 Controller 中（简单，无需下沉到 Service）

## 前端改动
- `services/nodes.ts` — 新增 checkNode 函数
- `pages/nodes/NodeListPage.tsx` — 新增：
  - checkStatus 状态（Map<nodeId, result | 'checking'>）
  - 单个检测按钮（Wifi 图标）
  - 全部检测按钮（Activity 图标）
  - "可用性"列显示检测结果
  - 检测中显示 Loader2 旋转动画

## 涉及文件
### 后端（修改 1 个）
- `controller/NodeController.java` — 新增 check 接口

### 前端（修改 2 个）
- `services/nodes.ts` — 新增 checkNode
- `pages/nodes/NodeListPage.tsx` — 新增检测 UI 和逻辑
