const axios = require('axios');
const ytdl = require('ytdl-core');

module.exports = {
    name: 'play',
    command: ['play', 'musica', 'tocar'],
    tags: 'downloads',
    desc: 'Toca música do YouTube',
    run: async (sock, { from, text }) => {
        if (!text) {
            return await sock.sendMessage(from, { text: '❌ Use: !play <nome da música>' });
        }

        await sock.sendMessage(from, { text: '🎵 *Procurando música...*' });
        
        try {
            const search = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(text)}`);
            const videoId = search.data.split('"videoId":"')[1]?.split('"')[0];
            
            if (!videoId) {
                return await sock.sendMessage(from, { text: '❌ Música não encontrada!' });
            }

            const info = await ytdl.getInfo(videoId);
            const audioUrl = info.formats.find(f => f.mimeType?.startsWith('audio/mp4'));
            
            if (audioUrl?.url) {
                await sock.sendMessage(from, { 
                    audio: { url: audioUrl.url },
                    mimetype: 'audio/mp4',
                    fileName: `${info.videoDetails.title}.mp3`
                }, { quoted: null });
            } else {
                await sock.sendMessage(from, { text: '❌ Erro ao baixar áudio' });
            }
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Erro: ${err.message}` });
        }
    }
};
