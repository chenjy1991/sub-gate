# 008 - 我的订阅

## 需求背景

现有「订阅管理」是管理员视角的功能。需要新增一个面向普通用户的「我的订阅」页面，让用户查看自己有权访问的订阅、订阅下的节点状态，以及获取不同客户端格式的订阅链接。

## 功能列表

### 1. 我的订阅页面（左右分栏）

**左侧 - 订阅列表：**
- 展示当前用户有权访问的所有订阅（直接分配 + 角色间接分配，取并集）
- 每个订阅显示：名称、备注
- 订阅链接区域：按客户端类型展示多个按钮，点击复制对应格式的订阅 URL
- 支持的客户端格式：通用 Base64、Clash/Mihomo、Surge、Shadowrocket、Quantumult X

**右侧 - 节点列表：**
- 选中某个订阅后，展示该订阅下所有节点
- 每个节点显示：名称、协议、可用性状态
- 切换订阅时自动检测一次所有节点可用性（无手动检测按钮）

### 2. 订阅链接（公开接口）

- 订阅 URL 格式：`{origin}/api/subscribe/{token}?type=clash`
- token = Base64Url(userId + ":" + subscriptionId)，userId 和 subscriptionId 均为雪花算法 ID
- 访问时实时校验：用户是否存在且正常、订阅是否存在且正常、用户是否有权访问该订阅
- 任一条件不满足则订阅失效（删除用户、取消分配、取消角色均可使链接失效）

### 3. 主键改造（雪花算法）

- 所有数据表主键从自增 ID 改为雪花算法（MyBatis-Plus ASSIGN_ID）
- 防止 ID 被遍历猜测

## 客户端格式说明

| 格式 | Content-Type | 说明 |
|------|-------------|------|
| base64 | text/plain | 所有节点链接逐行拼接后 Base64 编码（v2rayN/V2Box 通用） |
| clash | text/yaml | Clash/Mihomo YAML 配置（proxies + proxy-groups） |
| surge | text/plain | Surge 配置格式 |
| shadowrocket | text/plain | 同 Base64（Shadowrocket 兼容） |
| quantumultx | text/plain | Quantumult X 配置格式 |
