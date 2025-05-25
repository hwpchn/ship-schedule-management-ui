# 船期管理系统前端

一个专业的物流船期管理系统前端应用，基于 Vue3 + Vite + Element Plus 构建。

## 🚀 技术栈

- **框架**: Vue 3.4+ (Composition API)
- **构建工具**: Vite 5.2+
- **UI 库**: Element Plus 2.6+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.3+
- **HTTP 客户端**: Axios 1.6+
- **包管理**: pnpm
- **样式**: Sass/SCSS
- **图标**: Element Plus Icons

## ✨ 功能特性

### 🔐 认证系统
- ✅ 现代化的登录/注册界面
- ✅ 基于 JWT 的身份认证
- ✅ 自动 token 刷新机制
- ✅ 路由权限守卫
- ✅ 响应式设计，支持移动端

### 🎨 界面设计
- ✅ 专业的物流行业设计风格
- ✅ 微妙的动画特效（磨砂玻璃、渐变背景、悬浮效果）
- ✅ 统一的视觉规范
- ✅ Element Plus 深度定制
- ✅ 暗色模式支持

### 🛠️ 开发体验
- ✅ TypeScript 类型推导
- ✅ 组件和API自动导入
- ✅ 热模块更新(HMR)
- ✅ 统一的错误处理
- ✅ 请求和响应拦截器

## 📁 项目结构

```
ship_schedule_ui/
├── public/                     # 静态资源
├── src/
│   ├── api/                   # API 接口定义
│   │   ├── request.js         # Axios 配置和拦截器
│   │   └── auth.js           # 认证相关 API
│   ├── components/           # 公共组件
│   ├── router/              # 路由配置
│   │   └── index.js         # 路由定义和守卫
│   ├── stores/              # 状态管理
│   │   └── auth.js          # 认证状态管理
│   ├── styles/              # 全局样式
│   │   └── index.scss       # 样式入口文件
│   ├── views/               # 页面组件
│   │   ├── auth/            # 认证相关页面
│   │   │   ├── Login.vue    # 登录页面
│   │   │   └── Register.vue # 注册页面
│   │   ├── error/           # 错误页面
│   │   │   └── 404.vue      # 404页面
│   │   └── Dashboard.vue    # 仪表盘
│   ├── App.vue              # 根组件
│   └── main.js              # 应用入口
├── index.html               # HTML 模板
├── vite.config.js          # Vite 配置
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 🛠️ 快速开始

### 环境要求
- Node.js 16.0+
- pnpm 7.0+

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本
```bash
pnpm build
```

### 预览生产构建
```bash
pnpm preview
```

## 📡 API 对接

项目配置了代理，自动将 `/api/*` 请求转发到后端服务器 `http://localhost:8000`。

### 支持的API接口
- `POST /api/auth/register/` - 用户注册
- `POST /api/auth/login/` - 用户登录  
- `POST /api/auth/logout/` - 用户登出
- `GET /api/auth/user/` - 获取用户信息
- `POST /api/auth/token/refresh/` - 刷新令牌

详细API文档请参考 [api.md](./api.md)

## 🎨 设计特色

### 现代化界面
- **磨砂玻璃效果**: 使用 `backdrop-filter: blur()` 实现卡片透明效果
- **渐变背景**: 专业的紫蓝色渐变，符合物流行业特点
- **微动画**: 卡片滑入、图标悬浮、按钮变换等微妙交互

### 响应式设计
- 移动端优先的设计理念
- 断点适配：768px, 480px
- 触摸友好的交互区域

### 主题色彩
- **主色调**: #409eff (Element Plus 蓝)
- **辅助色**: #667eea, #764ba2 (渐变紫蓝)
- **成功色**: #67c23a
- **警告色**: #e6a23c

## 🔧 配置说明

### Vite 配置
- 自动导入 Vue 3 Composition API
- Element Plus 组件按需导入
- 路径别名 `@` 指向 `src` 目录
- 开发代理配置

### 构建优化
- 代码分割：vendor 和 elementPlus 单独打包
- 静态资源优化
- gzip 压缩支持

## 🚀 部署

### 环境变量
在生产环境中，请配置以下环境变量：
- API 服务器地址
- 静态资源 CDN

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://your-backend-server:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📱 移动端适配

项目已针对移动端进行优化：
- 响应式布局
- 触摸友好的交互
- 移动端键盘适配
- 视口优化

## 🔐 安全特性

- JWT 令牌安全存储
- 请求拦截和响应处理
- XSS 防护
- CSRF 防护
- 路由权限控制

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📝 开发规范

### 代码风格
- 使用 ESLint + Prettier
- Vue 3 Composition API
- 组件采用 `<script setup>` 语法
- 样式使用 SCSS

### 文件命名
- 组件：PascalCase (如：`UserProfile.vue`)
- 页面：PascalCase (如：`Dashboard.vue`)
- 工具文件：camelCase (如：`request.js`)

### Git 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具变动

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

如有问题或建议，请通过以下方式联系：
- 项目 Issues: [GitHub Issues](https://github.com/your-repo/ship_schedule_ui/issues)
- 邮箱: your-email@example.com

---

**船期管理系统** - 让物流管理更简单、更高效 🚢