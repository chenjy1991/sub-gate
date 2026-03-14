# 007 - 节点链接生成 - 执行记录

## 实际改动文件

| 文件 | 改动说明 |
|------|----------|
| `backend/.../service/SysNodeService.java` | 接口新增 `generateLink(SysNode)` 方法声明 |
| `backend/.../service/impl/SysNodeServiceImpl.java` | 实现 `generateLink` + 5 个协议生成方法 + `encodeParam` 工具方法 |
| `backend/.../controller/NodeController.java` | 新增 `POST /api/node/generateLink`，复用 `IdReq` |
| `front/src/services/nodes.ts` | 新增 `generateLink(id)` API 函数 |
| `front/src/pages/nodes/NodeListPage.tsx` | 操作列新增 Link 按钮，新增链接展示 Dialog（含复制功能） |

## 设计决策

1. 链接生成逻辑与已有的 `parseSingleLink` 解析逻辑完全对称，确保 parse → generate 可逆
2. vmess 使用 v2rayN 标准 JSON 格式（含 `"v": "2"` 版本号），Base64 标准编码（非 URL-safe）
3. ss 使用 SIP002 格式（`base64(method:password)@host:port`），userinfo 部分用 URL-safe Base64 无 padding
4. 前端用 Dialog 展示链接而非 toast，因为链接较长，Dialog 更方便查看和复制
5. 复制按钮使用 `navigator.clipboard.writeText`，复制后显示"已复制"反馈 2 秒

## 编译验证

- `mvn clean compile -q` — 通过
- `pnpm build` — 通过
