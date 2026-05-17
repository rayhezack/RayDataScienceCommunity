# Ray Data Science Lab

面向数据科学课程学员的门户项目：免费开放 A/B 实验工具，会员开放课程答疑、简历优化和课程资料入口。

## 项目结构

- `frontend/`：React + Vite 前端，承载首页、课程介绍页、实验工具和会员入口。
- `backend/`：Flask 后端，承载 A/B 工具 API、SQLite 数据库初始化、邮箱密码登录、邀请码会员权限。
- `backend/schema.sql`：SQLite 表结构，启动时幂等初始化。
- `backend/manage_invites.py`：本地邀请码管理 CLI。
- `backend/test_auth.py`：登录、邀请码和会员权限测试。
- `backend/test_sample_size.py`：原有样本量计算校验脚本。

## 本地启动

后端：

```bash
cd backend
python app.py
```

前端：

```bash
cd frontend
npm run dev
```

默认地址：

- 前端：`http://127.0.0.1:5173/`
- 后端：`http://127.0.0.1:8000/`

## 邀请码

创建付费会员邀请码：

```bash
cd backend
python manage_invites.py create --code COURSE2026 --max-uses 1 --expires-at 2026-12-31
```

邀请码只存 hash，不会明文落库。学生注册时填写邀请码，或登录后在会员入口兑换。

## 验证命令

后端权限测试：

```bash
cd backend
python -m unittest test_auth.py
```

原有样本量测试：

```bash
cd backend
python test_sample_size.py
```

前端生产构建：

```bash
cd frontend
npm run build
```

## 清理策略

已通过 `.gitignore` 排除：

- 构建产物：`frontend/dist/`
- 前端依赖：`frontend/node_modules/`
- 本地数据库：`backend/app.db`
- Python 缓存：`__pycache__/`
- macOS 系统文件：`.DS_Store`
- 本地浏览器测试产物：`.playwright-cli/`

根目录的课程素材、历史提示词和模板文件暂时保留，避免误删业务资料。
