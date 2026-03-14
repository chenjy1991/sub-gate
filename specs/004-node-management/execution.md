# 节点配置 — 执行记录

## 实际改动

### 后端（新增 5 个文件）
- `entity/SysNode.java` — 实体类，17 个字段（id, name, address, port, protocol, uuid, alterId, security, network, tls, sni, path, host, rawLink, remark, status, sort）
- `mapper/SysNodeMapper.java` — 继承 BaseMapper，无自定义 SQL
- `service/SysNodeService.java` — 接口声明 listPage、parseLinks
- `service/impl/SysNodeServiceImpl.java` — 分页查询（keyword 模糊搜索 name/address）+ 链接解析（vmess/vless/trojan/ss/hysteria2 五种协议）
- `controller/NodeController.java` — 7 个接口：list/getById/create/update/delete/parse/import

### 前端（新增 4 个文件）
- `components/ui/textarea.tsx` — 手动创建 shadcn Textarea 组件（默认不包含）
- `services/nodes.ts` — 7 个 API 函数对接后端
- `pages/nodes/NodeListPage.tsx` — 列表页，含搜索、删除确认、批量导入 Dialog（解析预览 → 逐条排除 → 确认导入）
- `pages/nodes/NodeFormPage.tsx` — 表单页，新增/编辑复用，支持单条链接导入填充表单字段

### 数据库
- `db/init.sql` — 新增 `sys_node` 建表语句（CREATE TABLE IF NOT EXISTS）

### 路由
- `router/index.tsx` — 新增 `/nodes`、`/nodes/new`、`/nodes/:id/edit` 三条路由

### 类型
- `types/index.ts` — 新增 ProxyNode、ParseResult 接口

## 链接解析实现细节
- vmess — Base64 解码 JSON，提取 ps/add/port/id/aid/net/scy/host/path/tls/sni
- vless/trojan — URI 解析，query 参数提取 type/encryption/security/sni/host/path
- ss — 支持两种格式：`ss://base64@host:port` 和 `ss://base64`，解码后拆分 method:password
- hysteria2 — 兼容 `hy2://` 前缀，URI 解析

## 批量导入流程
1. 用户在 Dialog 中粘贴多行链接
2. 点击"解析"→ 调用 `/api/node/parse` → 返回 success + failed 两组
3. 预览表格展示成功解析的节点，可逐条移除
4. 点击"确认导入"→ 调用 `/api/node/import` → saveBatch 入库

## 遇到的问题
1. shadcn/ui 默认不包含 Textarea 组件 — 手动创建 `textarea.tsx`
2. vmess Base64 编码可能缺少 padding — 解析前补齐 `=`
3. ss 链接有两种编码格式 — 先尝试标准 Base64，失败后用 URL-safe Base64
