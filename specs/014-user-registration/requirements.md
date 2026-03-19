# 014 - 用户注册

## 需求背景

新增用户自助注册功能，注册后需通过邮箱激活。同时新增站点域名配置，用于生成激活链接。

## 功能列表

1. 注册页面（/register）：填写 username、email、password
2. 后端校验格式 + 唯一性 → 创建用户（status=0 未激活）→ 分配 USER 角色 → 发送激活邮件
3. 激活页面（/activate?token=xxx）：验证 JWT token → 激活用户 → 跳转登录
4. 重发激活邮件接口：输入 email 重新发送
5. 登录时 status=0 返回"账号未激活"提示
6. 系统配置页面新增站点配置（域名），用于生成激活链接
7. "邮件配置"菜单改名"系统配置"

## 激活 token 方案

JWT，24 小时过期，payload: `{ userId, type: 'activation' }`，无需额外存储。
