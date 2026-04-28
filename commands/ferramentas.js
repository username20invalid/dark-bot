const axios = require('axios');

module.exports = {
    name: 'ping',
    command: ['ping', 'latencia', 'test'],
    tags: 'ferramentas',
    desc: 'Testa latência',
    run: async (sock, { from }) => {
        const start = Date.now();
        await sock.sendMessage(from, { text: '🏓 Pong!' });
        const end = Date.now();
        await sock.sendMessage(from, { text: `⚡ Latência: ${end - start}ms` });
    }
};
