module.exports = {
    name: 'dono',
    command: ['dono', 'owner', 'criador'],
    tags: 'info',
    desc: 'Mostra informações do dono',
    run: async (sock, { from, isOwner }) => {
        const vcard = 'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:👑 Dono DARK BOT\n' +
            'TEL;type=CELL;type=VOICE;waid=244949926074:+244949926074\n' +
            'END:VCARD';

        await sock.sendMessage(from, { 
            contacts: { 
                displayName: '👑 Dono DARK BOT',
                contacts: [{ vcard }] 
            } 
        });
        
        if (isOwner) {
            await sock.sendMessage(from, { text: '👑 *Você é o dono do bot!*' });
        }
    }
};
