#!/bin/bash

echo "🚀 启动Gemini Chatbot前后端分离版本"
echo "================================================"

# 检查Node.js和npm
if ! command -v node &> /dev/null; then
    echo "❌ 错误：需要安装Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误：需要安装npm"
    exit 1
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "❌ 错误：找不到.env文件"
    exit 1
fi

# 检查API密钥
if grep -q "your_gemini_api_key_here" .env; then
    echo "❌ 错误：请在.env文件中设置正确的GEMINI_API_KEY"
    echo "📝 请访问 https://makersuite.google.com/app/apikey 获取API密钥"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo ""
echo "🔧 启动后端API服务器..."
echo "📡 地址: http://localhost:3000"
echo "🔍 健康检查: http://localhost:3000/api/health"
echo ""
echo "💡 提示："
echo "   - 后端服务器启动后，在浏览器访问 http://localhost:3000"
echo "   - 支持现代浏览器（Chrome, Safari, Firefox等）"
echo "   - Web前端会自动连接到后端API"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "================================================"

# 启动服务器
npm run server