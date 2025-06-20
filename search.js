const axios = require('axios');
const cheerio = require('cheerio');

class WebSearch {
    constructor() {
        this.searchEngines = {
            duckduckgo: 'https://duckduckgo.com/html/?q=',
            bing: 'https://www.bing.com/search?q='
        };
    }

    async searchWeb(query, maxResults = 3) {
        try {
            console.log(`🔍 正在搜索: ${query}`);
            
            // 使用DuckDuckGo进行搜索（免费且不需要API key）
            const searchUrl = `${this.searchEngines.duckduckgo}${encodeURIComponent(query)}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const results = [];

            // 解析DuckDuckGo搜索结果
            $('.result').each((index, element) => {
                if (index >= maxResults) return false;
                
                const title = $(element).find('.result__title a').text().trim();
                const url = $(element).find('.result__title a').attr('href');
                const snippet = $(element).find('.result__snippet').text().trim();
                
                if (title && url && snippet) {
                    results.push({
                        title,
                        url,
                        snippet
                    });
                }
            });

            if (results.length === 0) {
                // 备用方案：使用Bing搜索
                return await this.searchBing(query, maxResults);
            }

            return results;
        } catch (error) {
            console.error('搜索出错:', error.message);
            return [{
                title: '搜索失败',
                url: '',
                snippet: `很抱歉，无法完成网络搜索。错误信息: ${error.message}`
            }];
        }
    }

    async searchBing(query, maxResults = 3) {
        try {
            const searchUrl = `${this.searchEngines.bing}${encodeURIComponent(query)}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const results = [];

            $('.b_algo').each((index, element) => {
                if (index >= maxResults) return false;
                
                const title = $(element).find('h2 a').text().trim();
                const url = $(element).find('h2 a').attr('href');
                const snippet = $(element).find('.b_caption p').text().trim();
                
                if (title && url && snippet) {
                    results.push({
                        title,
                        url: url.startsWith('http') ? url : `https://www.bing.com${url}`,
                        snippet
                    });
                }
            });

            return results;
        } catch (error) {
            console.error('Bing搜索出错:', error.message);
            return [{
                title: '搜索不可用',
                url: '',
                snippet: '当前无法进行网络搜索，请稍后再试。'
            }];
        }
    }

    formatSearchResults(results) {
        if (!results || results.length === 0) {
            return '没有找到相关搜索结果。';
        }

        let formatted = '🌐 搜索结果：\n\n';
        results.forEach((result, index) => {
            formatted += `${index + 1}. **${result.title}**\n`;
            formatted += `   ${result.snippet}\n`;
            if (result.url) {
                formatted += `   🔗 ${result.url}\n`;
            }
            formatted += '\n';
        });

        return formatted;
    }
}

module.exports = WebSearch;