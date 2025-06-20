const { GoogleGenerativeAI } = require('@google/generative-ai');
const WebSearch = require('./search');

class Chatbot {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('需要提供Gemini API Key');
        }
        
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.webSearch = new WebSearch();
        this.conversationHistory = [];
    }

    async chat(userInput) {
        try {
            // 检查是否需要搜索
            const needsSearch = this.shouldSearch(userInput);
            let context = '';

            if (needsSearch) {
                console.log('🔍 检测到需要搜索最新信息...');
                const searchResults = await this.webSearch.searchWeb(userInput);
                context = this.webSearch.formatSearchResults(searchResults);
            }

            // 构建prompt
            let prompt = userInput;
            if (context) {
                prompt = `基于以下搜索结果回答用户问题：\n\n${context}\n\n用户问题：${userInput}\n\n请根据搜索结果提供准确、有帮助的回答。如果搜索结果不足以回答问题，请说明并提供你已知的相关信息。`;
            }

            // 添加对话历史作为上下文
            if (this.conversationHistory.length > 0) {
                const historyContext = this.conversationHistory
                    .slice(-4) // 只保留最近4轮对话
                    .map(item => `${item.role}: ${item.content}`)
                    .join('\n');
                prompt = `对话历史：\n${historyContext}\n\n当前问题：${prompt}`;
            }

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // 更新对话历史
            this.conversationHistory.push(
                { role: '用户', content: userInput },
                { role: '助手', content: response }
            );

            // 限制历史记录长度
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            return response;

        } catch (error) {
            console.error('Chatbot错误:', error);
            return `抱歉，处理您的请求时出现了错误：${error.message}`;
        }
    }

    shouldSearch(input) {
        const searchKeywords = [
            // 时间相关
            '今天', '昨天', '最新', '现在', '目前', '当前', '最近',
            '2024', '2025', '今年', '去年',
            
            // 新闻/事件相关  
            '新闻', '事件', '发生', '消息', '报道', '宣布',
            
            // 实时信息
            '天气', '股价', '汇率', '价格', '状态',
            
            // 搜索意图
            '搜索', '查找', '寻找', '哪里', '什么时候', '谁',
            
            // 品牌/产品
            '苹果', 'iPhone', 'ChatGPT', 'OpenAI', 'Google', '微软',
            '特斯拉', '比特币', '股票'
        ];

        const lowerInput = input.toLowerCase();
        return searchKeywords.some(keyword => 
            lowerInput.includes(keyword.toLowerCase())
        );
    }

    clearHistory() {
        this.conversationHistory = [];
        console.log('📝 对话历史已清空');
    }

    getHistoryLength() {
        return this.conversationHistory.length;
    }
}

module.exports = Chatbot;