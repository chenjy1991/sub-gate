# 节点配置 — 需求

## 背景
管理 V2Ray 代理节点，支持手动新增和通过链接批量导入。

## 功能需求
1. 节点列表（分页）、按名称/地址搜索
2. 新增节点（手动填写表单）
3. 编辑节点
4. 删除节点
5. 批量导入：粘贴多行链接 → 后端解析 → 预览表格（可逐条排除）→ 确认导入
6. 单条导入：新增/编辑页粘贴单条链接 → 解析后填充表单
7. 支持协议：vmess、vless、trojan、shadowsocks、hysteria2

## 数据字段
name, address, port, protocol, uuid, alterId, security, network, tls, sni, path, host, rawLink, remark, status, sort
