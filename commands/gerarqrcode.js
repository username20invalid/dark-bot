const axios = require('axios');

module.exports = {
    name: 'gerarqrcode',
    command: ['gerarqrcode', 'qr', 'qrcode'],
    tags: 'ferramentas',
    desc: 'Gera QR Code',
    run: async (sock, { from, text }) => {
        if (!text) return await sock.sendMessage(from, { text: '❌ Use: !gerarqrcode <texto>' });
        
        try {
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
            await sock.sendMessage(from, { image: { url }, caption: `✅ QR Code gerado!\n📝 ${text}` });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Erro: ${err.message}` });
        }
    }
};
