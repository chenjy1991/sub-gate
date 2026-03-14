# Changelog

## 0.1.0 (2026-03-14)

首个版本，从 Spring Boot + React/Vite 前后端分离架构迁移为 Next.js 全栈项目。

### 新增

- Next.js 15 全栈架构，单项目、单构建、单进程
- 用户管理：CRUD、邮箱字段、username 格式校验（英文+数字，英文开头）
- 角色管理：CRUD、细粒度按钮权限分配
- 权限管理：树形结构、菜单/按钮两级权限
- 节点管理：CRUD、5 协议链接解析（VMess/VLESS/Trojan/Shadowsocks/Hysteria2）、批量导入、链接生成、TCP 连通性检测
- 订阅管理：CRUD、节点/角色/用户分配、4 格式订阅输出（Base64/Clash/Surge/QuantumultX）
- 我的订阅：当前用户可访问的订阅列表和详情
- 用户注册 + 邮箱激活（JWT token，24 小时有效）
- 个人设置：修改昵称、修改密码
- 系统配置：站点域名、SMTP 邮件配置、测试邮件发送
- 首页 Landing Page（深色风格）
- JWT + HttpOnly Cookie 认证，无状态，重启不丢失
- RBAC 权限控制，侧边栏按用户权限动态显示
- 无权限用户显示欢迎页
- Docker 一键部署，首次启动自动初始化数据库
