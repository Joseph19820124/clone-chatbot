class ChatApp {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.isInitialized = false;
        this.isLoading = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.initializeChat();
    }

    initializeElements() {
        // 状态指示器
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        
        // 消息区域
        this.messagesContainer = document.getElementById('messages');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // 输入区域
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        
        // 工具栏按钮
        this.searchBtn = document.getElementById('searchBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.reconnectBtn = document.getElementById('reconnectBtn');
        
        // 搜索模态框
        this.searchModal = document.getElementById('searchModal');
        this.searchInput = document.getElementById('searchInput');
        this.performSearchBtn = document.getElementById('performSearch');
        this.cancelSearchBtn = document.getElementById('cancelSearch');
        this.closeSearchModalBtn = document.getElementById('closeSearchModal');
        
        // 错误消息关闭按钮
        this.closeErrorBtn = document.getElementById('closeError');
    }

    attachEventListeners() {
        // 发送消息
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.messageInput.addEventListener('input', () => this.updateSendButton());

        // 工具栏按钮
        this.searchBtn.addEventListener('click', () => this.showSearchModal());
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        this.reconnectBtn.addEventListener('click', () => this.initializeChat());

        // 搜索模态框
        this.performSearchBtn.addEventListener('click', () => this.performSearch());
        this.cancelSearchBtn.addEventListener('click', () => this.hideSearchModal());
        this.closeSearchModalBtn.addEventListener('click', () => this.hideSearchModal());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });

        // 关闭错误消息
        this.closeErrorBtn.addEventListener('click', () => this.hideError());

        // 模态框背景点击关闭
        this.searchModal.addEventListener('click', (e) => {
            if (e.target === this.searchModal) {
                this.hideSearchModal();
            }
        });
    }

    async initializeChat() {
        this.updateStatus('connecting', '连接中...');
        
        try {
            const response = await fetch(`${this.baseURL}/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.isInitialized = true;
                this.updateStatus('connected', '已连接');
                this.enableInput();
                this.addMessage('🤖 Gemini Chatbot 已准备就绪！我可以回答问题并进行网络搜索。', false, 'welcome');
            } else {
                throw new Error(data.message || '初始化失败');
            }
        } catch (error) {
            this.updateStatus('error', '连接失败');
            this.showError(`连接失败: ${error.message}`);
            console.error('初始化错误:', error);
        }
    }

    updateStatus(status, text) {
        this.statusDot.className = `status-dot ${status}`;
        this.statusText.textContent = text;
    }

    enableInput() {
        this.messageInput.disabled = false;
        this.updateSendButton();
        this.messageInput.focus();
    }

    disableInput() {
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;
    }

    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText || !this.isInitialized || this.isLoading;
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading || !this.isInitialized) return;

        // 添加用户消息
        this.addMessage(message, true);
        this.messageInput.value = '';
        this.updateSendButton();

        // 显示加载状态
        this.setLoading(true);

        try {
            const response = await fetch(`${this.baseURL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            if (data.success) {
                this.addMessage(data.response, false, 'normal', data.responseTime);
            } else {
                throw new Error(data.message || '发送消息失败');
            }
        } catch (error) {
            this.addMessage(`❌ 发送失败: ${error.message}`, false, 'error');
            console.error('发送消息错误:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;

        this.hideSearchModal();
        this.searchInput.value = '';

        // 添加搜索提示消息
        this.addMessage(`🔍 正在搜索: ${query}`, false, 'search');
        
        // 显示加载状态
        this.setLoading(true);

        try {
            const response = await fetch(`${this.baseURL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, maxResults: 3 })
            });

            const data = await response.json();
            
            if (data.success && data.results) {
                let resultText = '🔍 搜索结果：\n\n';
                data.results.forEach((result, index) => {
                    resultText += `${index + 1}. **${result.title}**\n`;
                    resultText += `${result.snippet}\n`;
                    resultText += `🔗 ${result.url}\n\n`;
                });
                
                this.addMessage(resultText, false, 'normal', data.responseTime);
            } else {
                throw new Error(data.message || '搜索失败');
            }
        } catch (error) {
            this.addMessage(`🔍❌ 搜索失败: ${error.message}`, false, 'error');
            console.error('搜索错误:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async clearHistory() {
        try {
            const response = await fetch(`${this.baseURL}/clear-history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.messagesContainer.innerHTML = '';
                this.addMessage('📝 对话历史已清空', false, 'normal');
            } else {
                throw new Error(data.message || '清空失败');
            }
        } catch (error) {
            this.showError(`清空历史失败: ${error.message}`);
            console.error('清空历史错误:', error);
        }
    }

    addMessage(content, isUser, type = 'normal', responseTime = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'} ${type}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // 处理Markdown格式的文本
        bubble.innerHTML = this.formatMessage(content);

        const meta = document.createElement('div');
        meta.className = 'message-meta';
        
        const time = new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let metaText = time;
        if (responseTime && !isUser) {
            metaText += ` • ${(responseTime / 1000).toFixed(2)}s`;
        }
        
        meta.textContent = metaText;

        contentDiv.appendChild(bubble);
        contentDiv.appendChild(meta);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(text) {
        // 简单的Markdown格式处理
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.loadingIndicator.style.display = loading ? 'flex' : 'none';
        this.updateSendButton();
        
        if (loading) {
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    showSearchModal() {
        this.searchModal.classList.add('show');
        setTimeout(() => this.searchInput.focus(), 100);
    }

    hideSearchModal() {
        this.searchModal.classList.remove('show');
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});