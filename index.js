require('dotenv').config();
const readline = require('readline');
const Chatbot = require('./chatbot');

class ChatbotApp {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.chatbot = null;
        this.isRunning = false;
    }

    async initialize() {
        console.log('🤖 Gemini Chatbot 初始化中...\n');
        
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            console.log('❌ 错误：请在.env文件中设置正确的GEMINI_API_KEY');
            console.log('📝 请访问 https://makersuite.google.com/app/apikey 获取API密钥');
            process.exit(1);
        }

        try {
            this.chatbot = new Chatbot(apiKey);
            console.log('✅ Chatbot初始化成功！');
            console.log('🔍 支持网络搜索功能');
            console.log('💬 开始对话吧！（输入 "quit" 或 "exit" 退出，"clear" 清空历史）\n');
            
            this.showHelp();
            this.startChat();
            
        } catch (error) {
            console.error('❌ 初始化失败:', error.message);
            process.exit(1);
        }
    }

    showHelp() {
        console.log('📋 可用命令：');
        console.log('  • quit/exit - 退出程序');
        console.log('  • clear - 清空对话历史');
        console.log('  • help - 显示帮助信息');
        console.log('  • search <关键词> - 直接搜索');
        console.log('─'.repeat(50));
    }

    async startChat() {
        this.isRunning = true;
        
        while (this.isRunning) {
            try {
                const input = await this.getUserInput('🧑 你：');
                
                if (!input.trim()) {
                    continue;
                }

                await this.handleInput(input.trim());
                
            } catch (error) {
                console.error('❌ 错误:', error.message);
            }
        }
    }

    async handleInput(input) {
        const lowerInput = input.toLowerCase();
        
        // 处理命令
        if (lowerInput === 'quit' || lowerInput === 'exit') {
            this.isRunning = false;
            console.log('👋 再见！');
            this.rl.close();
            return;
        }
        
        if (lowerInput === 'clear') {
            this.chatbot.clearHistory();
            console.log('✅ 对话历史已清空\n');
            return;
        }
        
        if (lowerInput === 'help') {
            this.showHelp();
            return;
        }
        
        if (lowerInput.startsWith('search ')) {
            const query = input.substring(7);
            console.log(`🔍 正在搜索: ${query}`);
            const searchResults = await this.chatbot.webSearch.searchWeb(query);
            const formatted = this.chatbot.webSearch.formatSearchResults(searchResults);
            console.log(formatted);
            return;
        }

        // 处理正常对话
        console.log('🤖 思考中...');
        const startTime = Date.now();
        
        const response = await this.chatbot.chat(input);
        
        const endTime = Date.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`🤖 Gemini (${responseTime}s)：`);
        console.log(response);
        console.log('─'.repeat(50));
    }

    getUserInput(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, (answer) => {
                resolve(answer);
            });
        });
    }
}

// 启动应用
const app = new ChatbotApp();
app.initialize().catch(error => {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 收到中断信号，正在关闭...');
    process.exit(0);
});