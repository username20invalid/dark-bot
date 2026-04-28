module.exports = {
    name: 'grupo',
    command: ['grupoinfo', 'groupinfo', 'gpinfo'],
    tags: 'grupo',
    desc: 'Mostra informações do grupo',
    run: async (sock, { from, isGroup, sender }) => {
        if (!isGroup) {
            return await sock.sendMessage(from, { text: '❌ Este comando só funciona em grupos!' });
        }
        
        const metadata = await sock.groupMetadata(from);
        const text = `📊 *INFORMAÇÕES DO GRUPO*

📌 *Nome:* ${metadata.subject}
🆔 *ID:* ${metadata.id}
👥 *Membros:* ${metadata.participants.length}
👑 *Dono:* ${metadata.owner ? metadata.owner.split('@')[0] : 'Desconhecido'}
📅 *Criado em:* ${metadata.creation ? new Date(metadata.creation * 1000).toLocaleDateString('pt-BR') : 'N/A'}
🔒 *Restrito:* ${metadata.restrict ? 'Sim' : 'Não'}
🔐 *Apenas Admins:* ${metadata.announce ? 'Sim' : 'Não'}`;
        
        await sock.sendMessage(from, { text });
    }
};
