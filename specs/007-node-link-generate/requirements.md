# 007 - 节点链接生成

## 需求背景

节点管理模块已支持通过链接导入节点（解析 vmess/vless/trojan/ss/hysteria2 链接为节点数据）。现需要反向功能：根据已有节点数据生成原始协议链接，方便用户导出、分享或在客户端中使用。

## 功能列表

1. 节点列表每行操作列新增"获取链接"按钮
2. 点击后调用后端接口，根据节点协议类型生成对应格式的原始链接
3. 弹窗展示生成的链接，支持一键复制

## 支持的协议及链接格式

| 协议 | 链接格式 |
|------|----------|
| vmess | `vmess://` + Base64 编码的 JSON（v2rayN 标准格式） |
| vless | `vless://uuid@host:port?params#name` |
| trojan | `trojan://password@host:port?params#name` |
| ss | `ss://base64(method:password)@host:port#name`（SIP002 格式） |
| hysteria2 | `hysteria2://password@host:port?params#name` |
