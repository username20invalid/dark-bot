module.exports = {
    name: 'menu',
    command: ['menu', 'help', 'comandos', 'ajuda'],
    tags: 'menu',
    desc: 'Mostra todos os comandos disponíveis',
    run: async (sock, { from, isOwner, sender, prefix }) => {
        const text = `╔═══════════════════════╗
║  🤖 *DARK BOT v1*     ║
║  👑 Dono: +244949926074
╚═══════════════════════╝

*📋 MENU DE COMANDOS*

━━━━━━━━━━━━━━━━━━━━━
*👑 DONO*
${prefix}dono - Info do dono
${prefix}bc - Broadcast (dono)
${prefix}eval - Executar código (dono)

━━━━━━━━━━━━━━━━━━━━━
*📥 DOWNLOADS*
${prefix}ytmp3 <link> - Audio YouTube
${prefix}ytmp4 <link> - Video YouTube  
${prefix}tiktok <link> - Video TikTok
${prefix}play <nome> - Tocar música

━━━━━━━━━━━━━━━━━━━━━
*🔧 FERRAMENTAS*
${prefix}sticker - Criar sticker
${prefix}toimg - Sticker → imagem
${prefix}tts <texto> - Texto → voz
${prefix}ip <ip> - Info IP
${prefix}cep <cep> - Buscar CEP

━━━━━━━━━━━━━━━━━━━━━
*📊 GRUPO*
${prefix}grupoinfo - Info do grupo
${prefix}link - Link do grupo
${prefix}tagall - Marcar todos

━━━━━━━━━━━━━━━━━━━━━
*🎮 DIVERSÃO*
${prefix}ping - Latência do bot
${prefix}google <query> - Pesquisar
${prefix}gerarqrcode <texto> - Gerar QR Code

━━━━━━━━━━━━━━━━━━━━━
DARK BOT v1 • 2025-2026`;
        
        await sock.sendMessage(from, { text });
    }
};
