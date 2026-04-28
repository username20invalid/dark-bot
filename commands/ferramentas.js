const axios = require('axios');

module.exports = {
    name: 'ping',
    command: ['ping', 'latencia', 'test'],
    tags: 'ferramentas',
    desc: 'Testa a latência do bot',
    run: async (sock, { from }) => {
        const start = Date.now();
        await sock.sendMessage(from, { text: '🏓 *Pong!*' });
        const end = Date.now();
        await sock.sendMessage(from, { text: `⚡ *Latência:* ${end - start}ms` });
    }
};
