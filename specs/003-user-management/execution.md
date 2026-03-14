# 用户管理 — 执行记录

## 实际改动

### 后端
- `UserController.java` — 完全重写，新增 getById 接口，list 返回 UserVO（含 roleCodes），create 加 BCrypt 密码加密和角色分配，update 支持密码留空不修改和角色变更

### 前端
- `types/index.ts` — 新增 AuthUser 类型，User 类型对齐后端 UserVO（id:number, nickname, status:number, roleCodes:string[]）
- `services/users.ts` — 全部对接真实 API（getUsers/getUserById/createUser/updateUser/deleteUser）
- `pages/users/UserListPage.tsx` — 重写，角色列显示 roleCodes 数组（加 ?? [] 防御 undefined），状态改为 number 判断
- `pages/users/UserFormPage.tsx` — 重写，新增密码字段，角色改为从后端动态加载的下拉选择
- `store/authStore.ts` — 改用 AuthUser
- `services/auth.ts` — 改用 AuthUser
- `mock/data/users.ts` — 已删除

## 遇到的问题
1. `user.roleCodes` 为 undefined 导致 `.map()` 报错 — 后端某些用户没有角色时返回 null，前端加了 `?? []` 兜底
2. `/api/user/getById` 返回 404 — 后端未重启，旧代码没有这个接口
