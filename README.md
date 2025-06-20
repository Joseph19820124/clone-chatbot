# Gemini Chatbot - 前后端分离版本

基于Google Gemini API的智能聊天机器人，支持CLI和现代化Web界面两种使用方式。

## 🚀 功能特性

- 🤖 基于Google Gemini 1.5 Flash模型的对话能力
- 🔍 智能网络搜索功能（支持实时信息查询）
- 💬 保持对话上下文和历史记录
- 🎯 智能判断何时需要搜索最新信息
- 📱 支持CLI命令行界面
- 🌐 现代化Web界面（HTML5 + CSS3 + JavaScript）
- 🔧 前后端分离架构，支持多客户端

## 📦 项目架构

```
chatbot/
├── 后端 (Node.js + Express)
│   ├── server.js           # Express API服务器
│   ├── chatbot.js          # 核心聊天机器人类
│   ├── search.js           # 网络搜索功能
│   └── index.js            # CLI版本入口
├── 前端 (Web界面)
│   └── web-frontend/       # 现代化Web应用
│       ├── index.html      # 主页面
│       ├── styles.css      # 样式文件
│       └── script.js       # 前端逻辑
├── 配置文件
│   ├── package.json        # Node.js依赖
│   ├── .env               # 环境变量
│   └── build-and-run.sh   # 启动脚本
└── README.md
```

## 🛠️ 安装和设置

### 1. 获取Gemini API密钥
- 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
- 创建新的API密钥

### 2. 配置环境变量
编辑 `.env` 文件，设置你的API密钥：
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. 安装依赖
```bash
npm install
```

## 🎮 使用方法

### 方式一：CLI命令行版本（传统）
```bash
npm start
# 或
node index.js
```

### 方式二：前后端分离版本

#### 启动后端API服务器
```bash
# 使用快速启动脚本
./build-and-run.sh

# 或手动启动
npm run server
```

后端服务器将在 `http://localhost:3000` 启动，提供以下API端点：
- `GET /api/health` - 健康检查
- `POST /api/init` - 初始化chatbot
- `POST /api/chat` - 发送消息
- `POST /api/search` - 网络搜索
- `POST /api/clear-history` - 清空历史
- `GET /api/stats` - 获取统计信息

#### 启动Web前端应用
1. 确保后端服务器已启动（运行上述命令）
2. 在浏览器中访问 `http://localhost:3000`
3. Web应用将自动加载并连接到后端API

### API使用示例

```bash
# 健康检查
curl http://localhost:3000/api/health

# 初始化chatbot
curl -X POST http://localhost:3000/api/init

# 发送消息
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好，今天天气怎么样？"}'

# 网络搜索
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "最新iPhone价格", "maxResults": 3}'
```

## 🎯 功能特性

### 智能搜索触发
程序会自动检测以下类型的问题并进行网络搜索：
- **时间相关**: 今天、最新、现在、最近、2024、2025
- **新闻事件**: 新闻、事件、消息、报道、宣布
- **实时信息**: 天气、股价、汇率、价格、状态
- **特定品牌**: 苹果、iPhone、ChatGPT、特斯拉、比特币

### Web前端特性
- 🎨 现代化响应式设计
- 💬 实时聊天界面
- 🔍 内置搜索功能
- 📊 响应时间显示
- 🗑️ 清空历史记录
- 🔄 自动重连机制
- ⚡ 快速操作按钮
- 📱 移动端适配
- 🌙 渐变色主题

## 🔧 技术栈

### 后端
- **AI模型**: Google Gemini 1.5 Flash
- **Web框架**: Express.js 4.18.2
- **搜索引擎**: DuckDuckGo (主要) + Bing (备用)
- **HTTP客户端**: Axios
- **HTML解析**: Cheerio
- **安全中间件**: Helmet, CORS

### 前端
- **UI技术**: HTML5 + CSS3 + JavaScript (ES6+)
- **平台**: 现代浏览器（Chrome, Safari, Firefox, Edge）
- **样式**: CSS Grid + Flexbox + CSS Variables
- **HTTP客户端**: Fetch API
- **架构**: 组件化JavaScript类

## 🚨 注意事项

1. **网络要求**: 确保网络连接正常，搜索功能需要访问外部网站
2. **安全性**: API密钥请妥善保管，不要提交到版本控制系统
3. **限制**: 某些搜索结果可能因网站反爬虫机制而受限
4. **浏览器要求**: 前端应用需要支持ES6+的现代浏览器

## 🐛 故障排除

### 常见问题
- **API密钥错误**: 检查.env文件中的GEMINI_API_KEY是否正确
- **端口占用**: 如果3000端口被占用，修改server.js中的端口号
- **搜索失败**: 检查网络连接，某些网站可能暂时不可访问
- **前端连接失败**: 确保后端服务器在localhost:3000运行
- **浏览器兼容性**: 确保使用Chrome 70+, Safari 12+, Firefox 65+等现代浏览器

### 检查服务状态
```bash
# 检查API服务器是否运行
curl http://localhost:3000/api/health

# 查看服务器日志
npm run server

# 检查端口占用
lsof -ti:3000
```

## 📄 许可证

ISC License

## 🔗 相关链接

- [Google AI Studio](https://makersuite.google.com/app/apikey) - 获取API密钥
- [Gemini API文档](https://ai.google.dev/docs) - 官方文档
- [MDN Web文档](https://developer.mozilla.org/) - Web前端开发参考