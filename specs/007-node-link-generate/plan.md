# 007 - 节点链接生成 - 实现计划

## 后端

### 接口设计

| 接口 | 方法 | 请求体 | 响应 |
|------|------|--------|------|
| `/api/node/generateLink` | POST | `{ id: Long }` | `Result<String>` — 生成的链接字符串 |

### Service 层

`SysNodeService` 新增方法：
- `String generateLink(SysNode node)` — 根据 protocol 字段分发到对应的生成方法

`SysNodeServiceImpl` 新增私有方法：
- `generateVmess(SysNode)` — 构建 JSON → Base64 编码
- `generateVless(SysNode)` — 拼接 URI 格式
- `generateTrojan(SysNode)` — 拼接 URI 格式
- `generateShadowsocks(SysNode)` — method:password Base64 编码 + SIP002 格式
- `generateHysteria2(SysNode)` — 拼接 URI 格式
- `encodeParam(String)` — URL 编码工具方法

## 前端

### 服务层

`src/services/nodes.ts` 新增：
- `generateLink(id: number): Promise<string>`

### 页面改动

`NodeListPage.tsx`：
- 操作列新增链接图标按钮（Link icon）
- 新增 Dialog 展示生成的链接，含复制按钮
- 状态：`linkOpen`、`linkText`、`linkLoading`、`copied`

## 涉及文件

| 文件 | 改动 |
|------|------|
| `backend/.../service/SysNodeService.java` | 接口新增 `generateLink` 方法 |
| `backend/.../service/impl/SysNodeServiceImpl.java` | 实现 5 种协议链接生成 |
| `backend/.../controller/NodeController.java` | 新增 `/api/node/generateLink` 接口 |
| `front/src/services/nodes.ts` | 新增 `generateLink` API 函数 |
| `front/src/pages/nodes/NodeListPage.tsx` | 操作列新增按钮 + 链接展示 Dialog |
