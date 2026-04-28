const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: 'google',
    command: ['google', 'pesquisar', 'g'],
    tags: 'ferramentas',
    desc: 'Pesquisa no Google',
    run: async (sock, { from, text }) => {
        if (!text) return await sock.sendMessage(from, { text: '❌ Use: !google <pesquisa>' });
        
        await sock.sendMessage(from, { text: `🔍 Pesquisando: ${text}...` });
        
        try {
            const { data } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(text)}&hl=pt-BR`, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const $ = cheerio.load(data);
            
            let results = '';
            $('div.g').slice(0, 5).each((i, el) => {
                const title = $(el).find('h3').text();
                const link = $(el).find('a').attr('href');
                const snippet = $(el).find('.VwiC3b').text();
                if (title && link) {
                    const cleanLink = link.startsWith('/url?q=') ? link.split('/url?q=')[1].split('&')[0] : link;
                    results += `\n${i+1}. *${title}*\n${snippet ? snippet.substring(0, 100) + '...' : ''}\n${cleanLink}\n`;
                }
            });
            
            if (results) {
                await sock.sendMessage(from, { text: `🔍 *Resultados para:* ${text}\n${results}\n_By DARK BOT_` });
            } else {
                await sock.sendMessage(from, { text: '❌ Nenhum resultado encontrado.' });
            }
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Erro: ${err.message}` });
        }
    }
};
