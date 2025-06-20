require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const Chatbot = require('./chatbot');

class ChatbotServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.chatbot = null;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // 安全中间件
        this.app.use(helmet({
            contentSecurityPolicy: false, // 允许内联样式和脚本
        }));
        
        // CORS配置 - 允许Web前端访问
        this.app.use(cors({
            origin: true, // 允许所有域名，生产环境建议配置具体域名
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // 静态文件服务
        this.app.use(express.static(path.join(__dirname, 'web-frontend')));

        // 解析JSON
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true }));

        // 请求日志
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        // 主页路由 - 服务Web前端
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'web-frontend', 'index.html'));
        });

        // 健康检查
        this.app.get('/api/health', (req, res) => {
            res.json({ 
                status: 'ok', 
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                frontend: 'Web UI available at http://localhost:3000'
            });
        });

        // 初始化chatbot
        this.app.post('/api/init', async (req, res) => {
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                
                if (!apiKey || apiKey === 'your_gemini_api_key_here') {
                    return res.status(500).json({
                        error: 'GEMINI_API_KEY not configured',
                        message: '请在.env文件中配置正确的Gemini API密钥'
                    });
                }

                this.chatbot = new Chatbot(apiKey);
                res.json({
                    success: true,
                    message: 'Chatbot初始化成功',
                    features: ['conversation', 'web_search', 'context_memory']
                });

            } catch (error) {
                console.error('初始化错误:', error);
                res.status(500).json({
                    error: 'initialization_failed',
                    message: error.message
                });
            }
        });

        // 发送消息
        this.app.post('/api/chat', async (req, res) => {
            try {
                if (!this.chatbot) {
                    return res.status(400).json({
                        error: 'chatbot_not_initialized',
                        message: '请先初始化chatbot'
                    });
                }

                const { message } = req.body;
                
                if (!message || typeof message !== 'string') {
                    return res.status(400).json({
                        error: 'invalid_message',
                        message: '消息内容不能为空'
                    });
                }

                const startTime = Date.now();
                const response = await this.chatbot.chat(message);
                const responseTime = Date.now() - startTime;

                res.json({
                    success: true,
                    response: response,
                    responseTime: responseTime,
                    timestamp: new Date().toISOString(),
                    historyLength: this.chatbot.getHistoryLength()
                });

            } catch (error) {
                console.error('聊天错误:', error);
                res.status(500).json({
                    error: 'chat_failed',
                    message: error.message
                });
            }
        });

        // 搜索功能
        this.app.post('/api/search', async (req, res) => {
            try {
                if (!this.chatbot) {
                    return res.status(400).json({
                        error: 'chatbot_not_initialized',
                        message: '请先初始化chatbot'
                    });
                }

                const { query, maxResults = 3 } = req.body;
                
                if (!query || typeof query !== 'string') {
                    return res.status(400).json({
                        error: 'invalid_query',
                        message: '搜索查询不能为空'
                    });
                }

                const startTime = Date.now();
                const searchResults = await this.chatbot.webSearch.searchWeb(query, maxResults);
                const responseTime = Date.now() - startTime;

                res.json({
                    success: true,
                    results: searchResults,
                    query: query,
                    responseTime: responseTime,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('搜索错误:', error);
                res.status(500).json({
                    error: 'search_failed',
                    message: error.message
                });
            }
        });

        // 清空历史记录
        this.app.post('/api/clear-history', (req, res) => {
            try {
                if (!this.chatbot) {
                    return res.status(400).json({
                        error: 'chatbot_not_initialized',
                        message: '请先初始化chatbot'
                    });
                }

                this.chatbot.clearHistory();
                res.json({
                    success: true,
                    message: '对话历史已清空'
                });

            } catch (error) {
                console.error('清空历史错误:', error);
                res.status(500).json({
                    error: 'clear_failed',
                    message: error.message
                });
            }
        });

        // 获取聊天统计
        this.app.get('/api/stats', (req, res) => {
            try {
                if (!this.chatbot) {
                    return res.status(400).json({
                        error: 'chatbot_not_initialized',
                        message: '请先初始化chatbot'
                    });
                }

                res.json({
                    success: true,
                    stats: {
                        historyLength: this.chatbot.getHistoryLength(),
                        initialized: true,
                        timestamp: new Date().toISOString()
                    }
                });

            } catch (error) {
                console.error('获取统计错误:', error);
                res.status(500).json({
                    error: 'stats_failed',
                    message: error.message
                });
            }
        });

        // 404处理
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'not_found',
                message: '请求的端点不存在',
                path: req.originalUrl
            });
        });

        // 错误处理中间件
        this.app.use((error, req, res, next) => {
            console.error('服务器错误:', error);
            res.status(500).json({
                error: 'internal_server_error',
                message: '服务器内部错误'
            });
        });
    }

    async start() {
        try {
            this.app.listen(this.port, () => {
                console.log(`🚀 Chatbot API服务器启动成功`);
                console.log(`📡 地址: http://localhost:${this.port}`);
                console.log(`🔍 健康检查: http://localhost:${this.port}/api/health`);
                console.log(`📖 API文档:`);
                console.log(`   POST /api/init - 初始化chatbot`);
                console.log(`   POST /api/chat - 发送消息`);
                console.log(`   POST /api/search - 网络搜索`);
                console.log(`   POST /api/clear-history - 清空历史`);
                console.log(`   GET  /api/stats - 获取统计信息`);
                console.log(`   GET  /api/health - 健康检查`);
                console.log('─'.repeat(50));
            });
        } catch (error) {
            console.error('启动失败:', error);
            process.exit(1);
        }
    }
}

// 启动服务器
const server = new ChatbotServer();
server.start();

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 收到中断信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 收到终止信号，正在关闭服务器...');
    process.exit(0);
});