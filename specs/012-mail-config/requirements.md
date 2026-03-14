# 012 - 邮件发送配置

## 需求背景

后续用户注册需要校验邮箱真实性进行激活，需要先实现 SMTP 邮件发送配置功能。管理员在系统管理中配置 SMTP 参数，并可发送测试邮件验证配置是否正确。

## 功能列表

1. 新建 `sys_config` 通用配置表（key-value），用于存储系统级配置
2. 邮件配置页面：配置 SMTP host/port/secure/user/pass/from
3. 保存配置到数据库
4. 发送测试邮件（HTML 模板，包含系统名称、配置摘要、发送时间）
5. 测试失败时返回具体 nodemailer 错误信息
6. 权限控制：`system:mail` 菜单 + `mail:list`/`mail:config`/`mail:test` 按钮权限

## 数据字段

### sys_config 表

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | INTEGER | PK | 自增主键 |
| config_key | TEXT | NOT NULL, UNIQUE | 配置键 |
| config_value | TEXT | NOT NULL, DEFAULT '' | 配置值（JSON 字符串） |
| remark | TEXT | | 备注 |

### 邮件配置 JSON 结构（config_key = 'mail'）

| 字段 | 类型 | 说明 |
|---|---|---|
| host | string | SMTP 服务器地址 |
| port | number | SMTP 端口 |
| secure | boolean | 是否使用 SSL/TLS |
| user | string | 发件人邮箱账号 |
| pass | string | 授权码/密码（明文存储） |
| from | string | 发件人显示名称 |
