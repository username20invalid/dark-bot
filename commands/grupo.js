module.exports = {
    name: 'grupoinfo',
    command: ['grupoinfo', 'groupinfo'],
    tags: 'grupo',
    desc: 'Info do grupo',
    run: async (sock, { from, isGroup }) => {
        if (!isGroup) return await sock.sendMessage(from, { text: '❌ Só em grupos!' });
        const meta = await sock.groupMetadata(from);
        const text = `📊 *INFO DO GRUPO*\n\n📌 Nome: ${meta.subject}\n👥 Membros: ${meta.participants.length}\n👑 Dono: ${meta.owner ? meta.owner.split('@')[0] : 'N/A'}\n🔒 Restrito: ${meta.restrict ? 'Sim' : 'Não'}`;
        await sock.sendMessage(from, { text });
    }
};
