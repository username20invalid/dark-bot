const axios = require('axios');

module.exports = {
    name: 'ip',
    command: ['ip', 'meuip', 'ipinfo'],
    tags: 'ferramentas',
    desc: 'Info de IP',
    run: async (sock, { from, text }) => {
        const ip = text || (await axios.get('https://api.ipify.org')).data;
        try {
            const { data } = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp,org,as,query,lat,lon,timezone`);
            if (data.status === 'fail') return await sock.sendMessage(from, { text: '❌ IP inválido!' });
            
            await sock.sendMessage(from, { text: `🌐 *INFO IP*\n\n📌 IP: ${data.query}\n🌍 País: ${data.country}\n📍 Região: ${data.regionName}\n🏙️ Cidade: ${data.city}\n🏢 ISP: ${data.isp}\n🏛️ Org: ${data.org}\n🕐 Fuso: ${data.timezone}\n📍 Localização: ${data.lat}, ${data.lon}` });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Erro: ${err.message}` });
        }
    }
};
