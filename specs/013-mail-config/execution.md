# 013 - 邮件发送配置 — 执行记录（回填）

## 说明

本文件为历史执行记录回填，基于当前仓库中的邮件配置与系统配置实现补录。

## 实际改动

### 数据与后端
- `lib/db/schema.ts` — 新增 `sys_config` 配置表
- `lib/db/seed.ts` — 增加系统配置相关权限与管理员邮箱种子数据
- `app/api/config/get/route.ts`、`app/api/config/save/route.ts` — 新增配置读取与保存接口
- `app/api/mail/test/route.ts` — 新增测试邮件发送接口
- `lib/mail.ts` — 封装邮件配置读取、测试邮件与激活邮件发送能力

### 页面与前端调用
- `app/console/mail/page.tsx` — 新增系统配置页面，承载邮件配置与站点配置
- `services/config.ts` — 对接配置读取、保存与测试邮件接口
- `types/index.ts` — 补充邮件配置、站点配置等类型
- `components/layout/Sidebar.tsx` — 增加系统配置入口

## 设计决策

1. 使用 `sys_config` 统一承载系统级 JSON 配置，避免为邮件配置单独建表
2. 配置保存与测试发送分离，便于先校验再上线
3. 通过权限码控制查看、保存、测试三个操作

## 验证

1. 当前仓库中已存在 `sys_config`、配置接口、邮件发送工具和系统配置页面
2. 本次为历史文档回填，未单独复现当次功能开发过程
