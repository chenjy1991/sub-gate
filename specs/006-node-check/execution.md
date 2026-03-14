# 节点可用性检测 — 执行记录

## 实际改动

### 后端（修改 1 个文件）
- `controller/NodeController.java` — 新增 `POST /api/node/check` 接口，逻辑直接写在 Controller 中：通过 `java.net.Socket` 连接 `node.address:node.port`，超时 5 秒，返回 `{ reachable: boolean, latency: number }`

### 前端（修改 2 个文件）
- `services/nodes.ts` — 新增 `checkNode(id)` 函数，调用 `/api/node/check`
- `pages/nodes/NodeListPage.tsx` — 新增：
  - `checkStatus` 状态：`Map<number, { reachable, latency } | 'checking'>`
  - 表头新增"可用性"列
  - 每行新增 Wifi 图标按钮（单个检测）
  - 顶部新增"全部检测"按钮（Activity 图标），串行检测当前页所有节点
  - 检测中显示 Loader2 旋转动画，完成后显示"可用"（绿色）或"不可用"（红色）

## 设计决策
1. TCP Socket 而非 ICMP — 浏览器无法发 ICMP ping，后端用 TCP 探测更可靠
2. 逻辑留在 Controller — 检测逻辑简单（10 行代码），无需下沉到 Service 层
3. 串行检测而非并行 — 避免同时发起大量 Socket 连接，对服务器和目标节点更友好
4. 显示"可用/不可用"而非延迟毫秒数 — TCP 连接延迟不等于实际代理延迟，避免误导

## 遇到的问题
无特殊问题。
