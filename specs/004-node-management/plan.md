# 节点配置 — 计划

## 数据模型
- `sys_node` 表：id, name, address, port, protocol, uuid, alter_id, security, network, tls, sni, path, host, raw_link, remark, status, sort

## 后端接口
| 路径 | 说明 |
|------|------|
| `POST /api/node/list` | 分页列表，支持 keyword 搜索 |
| `POST /api/node/getById` | 获取单个 |
| `POST /api/node/create` | 新增 |
| `POST /api/node/update` | 编辑 |
| `POST /api/node/delete` | 删除 |
| `POST /api/node/parse` | 解析链接（不入库），返回 { success, failed } |
| `POST /api/node/import` | 批量入库 |

## 链接解析
- `SysNodeServiceImpl.parseLinks()` 逐行解析，支持 vmess/vless/trojan/ss/hysteria2
- 解析结果分 success 和 failed 两组返回

## 前端页面
- `/nodes` — NodeListPage（列表 + 搜索 + 删除 + 批量导入 Dialog）
- `/nodes/new` — NodeFormPage（Card 表单 + 单条导入填充）
- `/nodes/:id/edit` — NodeFormPage 复用

## 页面职责划分
- 批量导入放在列表页（Dialog 内完成）
- 表单页只处理单条（新增/编辑 + 单条导入填充）

## 涉及文件
### 后端（新增 5 个）
- `entity/SysNode.java`
- `mapper/SysNodeMapper.java`
- `service/SysNodeService.java`
- `service/impl/SysNodeServiceImpl.java`（含链接解析）
- `controller/NodeController.java`

### 前端（新增 4 个）
- `src/components/ui/textarea.tsx`
- `src/services/nodes.ts`
- `src/pages/nodes/NodeListPage.tsx`
- `src/pages/nodes/NodeFormPage.tsx`
