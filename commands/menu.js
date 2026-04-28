module.exports = {
    name: 'menu',
    command: ['menu', 'help', 'comandos'],
    tags: 'menu',
    desc: 'Mostra todos os comandos',
    run: async (sock, { from, prefix }) => {
        const text = `╔═══════════════════════╗
║  🤖 *DARK BOT v1*     ║
║  👑 +244949926074
╚═══════════════════════╝

*📋 MENU DE COMANDOS*

━━━━━━━━━━━━━━━━━
*👑 DONO*
${prefix}dono - Info do dono

━━━━━━━━━━━━━━━━━
*🔧 FERRAMENTAS*
${prefix}ping - Latência
${prefix}google <query> - Pesquisar
${prefix}ip <ip> - Info IP
${prefix}cep <cep> - Buscar CEP
${prefix}clima <cidade> - Clima

━━━━━━━━━━━━━━━━━
*📊 GRUPO*
${prefix}grupoinfo - Info do grupo

━━━━━━━━━━━━━━━━━
*🎮 DIVERSÃO*
${prefix}gerarqrcode <texto> - QR Code

DARK BOT v1 • 2026`;
        
        await sock.sendMessage(from, { text });
    }
};
