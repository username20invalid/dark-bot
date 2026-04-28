module.exports = {
    name: 'dono',
    command: ['dono', 'owner', 'criador'],
    tags: 'info',
    desc: 'Info do dono',
    run: async (sock, { from, isOwner }) => {
        const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:👑 Dono DARK BOT\nTEL;type=CELL;type=VOICE;waid=244949926074:+244949926074\nEND:VCARD';
        await sock.sendMessage(from, { contacts: { displayName: '👑 Dono DARK BOT', contacts: [{ vcard }] } });
        if (isOwner) await sock.sendMessage(from, { text: '👑 *Você é o dono do bot!*' });
    }
};
