# 影中镜 Cinematic Mirror - 后端服务

AI驱动的电影人格分析和造型设计平台后端 API。

## 技术栈

- **运行时**: Node.js + TypeScript
- **框架**: Express.js
- **数据库**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **认证**: JWT

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

`.env` 文件已预配置，如需修改请编辑该文件。

### 3. 初始化数据库

运行以下命令查看数据库初始化 SQL：

```bash
npm run db:init
```

然后在 Supabase 控制台的 SQL Editor 中执行输出的 SQL 语句。

### 4. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

服务将运行在 http://localhost:3001

## API 接口

### 认证接口 `/api/auth`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /register | 用户注册 |
| POST | /login | 用户登录 |
| GET | /me | 获取当前用户信息 |
| PUT | /me | 更新用户信息 |

### 试镜接口 `/api/interview`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /start | 开始新的试镜 |
| POST | /session/:sessionId/message | 发送试镜消息 |
| POST | /session/:sessionId/generate | 生成人格档案 |
| GET | /profiles | 获取用户所有档案 |
| GET | /profiles/:profileId | 获取单个档案 |

### 咨询接口 `/api/consultation`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /start | 开始咨询会话 |
| POST | /session/:sessionId/message | 发送咨询消息 |
| DELETE | /session/:sessionId | 结束咨询会话 |
| GET | /session/:sessionId/history | 获取会话历史 |

### 电影广场 `/api/plaza`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /posts | 获取帖子列表 |
| GET | /posts/:postId | 获取单个帖子 |
| POST | /posts | 创建帖子 |
| DELETE | /posts/:postId | 删除帖子 |
| POST | /posts/:postId/like | 点赞帖子 |
| DELETE | /posts/:postId/like | 取消点赞 |
| GET | /posts/:postId/comments | 获取评论 |
| POST | /posts/:postId/comments | 添加评论 |
| DELETE | /comments/:commentId | 删除评论 |

## 目录结构

```
src/
├── config/          # 配置文件
│   ├── supabase.ts  # Supabase 客户端
│   ├── gemini.ts    # Gemini AI 客户端
│   └── constants.ts # 常量和提示词
├── controllers/     # 控制器
├── middleware/      # 中间件
├── routes/          # 路由
├── services/        # 业务逻辑
├── types/           # 类型定义
├── utils/           # 工具函数
├── scripts/         # 脚本
└── index.ts         # 入口文件
```

## 前端对接

前端需要在请求头中携带 JWT Token：

```javascript
fetch('/api/interview/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
```
