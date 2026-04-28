const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Cores
const colors = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m'
};

const banner = `
${colors.red}╔══════════════════════════════════════╗
║        ${colors.cyan}██╗  ██╗ █████╗ ██████╗ ██╗  ██╗${colors.red}        ║
║        ${colors.cyan}██║  ██║██╔══██╗██╔══██╗██║ ██╔╝${colors.red}        ║
║        ${colors.cyan}███████║███████║██████╔╝█████╔╝ ${colors.red}        ║
║        ${colors.cyan}██╔══██║██╔══██║██╔══██╗██╔═██╗ ${colors.red}        ║
║        ${colors.cyan}██║  ██║██║  ██║██║  ██║██║  ██╗${colors.red}        ║
║        ${colors.cyan}╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝${colors.red}        ║
║                                                    ║
║  ${colors.yellow}🤖 DARK BOT v1.0${colors.red}                                ║
║  ${colors.yellow}👑 Dono: ${config.ownerNumber}${colors.red}        ║
║  ${colors.yellow}📅 2026${colors.red}                                           ║
╚══════════════════════════════════════╝${colors.reset}
`;

console.log(banner);

const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const cmd = require(path.join(commandsPath, file));
        commands.set(cmd.name, cmd);
        if (cmd.command) cmd.command.forEach(c => commands.set(c, cmd));
    }
    console.log(`${colors.green}[✓]${colors.reset} ${commands.size} comandos carregados`);
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        version: [2, 3000, 1015901307],
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser: ['DARK BOT', 'Chrome', '1.0.0'],
        markOnlineOnConnect: true,
        syncFullHistory: false,
        generateHighQualityLinkPreview: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log(`\n${colors.yellow}[!] Escaneie o QR Code com o WhatsApp de ${config.ownerNumber}${colors.reset}`);
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'open') {
            console.log(`\n${colors.green}[✓] DARK BOT CONECTADO!${colors.reset}`);
            console.log(`${colors.green}[✓] Número: ${sock.user.id.split(':')[0]}${colors.reset}`);
            
            const ownerJid = config.ownerNumber + '@s.whatsapp.net';
            await sock.sendMessage(ownerJid, { 
                text: `🤖 *DARK BOT v1*\n✅ Conectado com sucesso!\n📱 Use *${config.prefix}menu* para ver os comandos.`
            });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`${colors.red}[✗] Conexão fechada. Reconectando: ${shouldReconnect}${colors.reset}`);
            if (shouldReconnect) setTimeout(startBot, 3000);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.message || msg.key?.fromMe) continue;
            
            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            const senderNumber = sender.replace('@s.whatsapp.net', '');
            const isGroup = from.endsWith('@g.us');
            const messageText = msg.message?.conversation || 
                                msg.message?.extendedTextMessage?.text || '';
            
            const prefix = config.prefix;
            if (!messageText.startsWith(prefix)) continue;

            const args = messageText.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift()?.toLowerCase();
            
            if (!commandName || !commands.has(commandName)) continue;

            try {
                await commands.get(commandName).run(sock, {
                    from, sender: senderNumber, isGroup,
                    isOwner: senderNumber === config.ownerNumber,
                    args, text: args.join(' '), msg, config, prefix
                });
            } catch (err) {
                console.error(`[!] Erro: ${err.message}`);
                await sock.sendMessage(from, { text: `❌ Erro: ${err.message}` });
            }
        }
    });

    // Bloquear chamadas
    sock.ev.on('call', async ([call]) => {
        if (config.rejectCalls) {
            try { await sock.rejectCall(call.id, call.from); } catch(e) {}
        }
    });
}

startBot().catch(err => {
    console.error(`${colors.red}[!] Erro fatal: ${err.message}${colors.reset}`);
    process.exit(1);
});
