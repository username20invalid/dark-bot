const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Cores para o terminal
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
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
║  ${colors.green}██╗   ██╗ ██╗${colors.reset}                              ${colors.red}║
║  ${colors.green}╚██╗ ██╔╝██╔╝${colors.reset}                              ${colors.red}║
║  ${colors.green} ╚████╔╝ ██║ ${colors.reset}                              ${colors.red}║
║  ${colors.green}  ╚██╔╝  ██║ ${colors.reset}                              ${colors.red}║
║  ${colors.green}   ██║   ██╗ ${colors.reset}                              ${colors.red}║
║  ${colors.green}   ╚═╝   ╚═╝ ${colors.reset}                              ${colors.red}║
║                                                    ║
║  ${colors.yellow}🤖 DARK BOT v1.0${colors.red}                                ║
║  ${colors.yellow}👑 Dono: ${config.ownerNumber}${colors.red}        ║
║  ${colors.yellow}📅 2025-2026${colors.red}                                   ║
╚══════════════════════════════════════╝${colors.reset}
`;

console.log(banner);

const commands = new Map();

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        commands.set(command.name, command);
        if (command.command) {
            command.command.forEach(cmd => commands.set(cmd, command));
        }
    }
    console.log(`${colors.green}[✓]${colors.reset} ${commands.size} comandos carregados`);
}

function getPrefix() {
    return config.prefix || '!';
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        version: [2, 3000, 1015901307],
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['DARK BOT', 'Chrome', '1.0.0'],
        markOnlineOnConnect: true,
        syncFullHistory: false,
        generateHighQualityLinkPreview: true
    });

    // QR Code no terminal
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log(`\n${colors.yellow}[!]${colors.reset} Escaneie o QR Code acima com o WhatsApp do número ${config.ownerNumber}`);
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'open') {
            console.log(`\n${colors.green}[✓]${colors.reset} ${colors.cyan}DARK BOT CONECTADO!${colors.reset}`);
            console.log(`${colors.green}[✓]${colors.reset} Número: ${sock.user.id.split(':')[0]}`);
            console.log(`${colors.green}[✓]${colors.reset} Prefixo: ${getPrefix()}`);
            console.log(`${colors.green}[✓]${colors.reset} Dono: ${config.ownerNumber}\n`);
            
            // Enviar mensagem de boas-vindas ao dono
            const ownerJid = config.ownerNumber + '@s.whatsapp.net';
            await sock.sendMessage(ownerJid, { 
                text: `╔═══════════════════════╗\n║  🤖 *DARK BOT v1*      ║\n║  ✅ Conectado com sucesso!\n║  📱 Ativo e funcionando!\n╚═══════════════════════╝\n\nUse *${getPrefix()}menu* para ver os comandos.`
            });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`${colors.red}[✗]${colors.reset} Conexão fechada. Reconectando: ${shouldReconnect}`);
            if (shouldReconnect) {
                startBot();
            }
        }
    });

    // Processar mensagens
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.message || msg.key?.fromMe) continue;
            
            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            const senderNumber = sender.replace('@s.whatsapp.net', '');
            const isGroup = from.endsWith('@g.us');
            const messageText = msg.message?.conversation || 
                                msg.message?.extendedTextMessage?.text || 
                                msg.message?.imageMessage?.caption ||
                                msg.message?.videoMessage?.caption || '';
            
            // Verificar se é comando
            const prefix = getPrefix();
            if (!messageText.startsWith(prefix)) return;

            const args = messageText.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift()?.toLowerCase();
            
            if (!commandName || !commands.has(commandName)) return;

            const command = commands.get(commandName);
            
            try {
                await command.run(sock, {
                    from,
                    sender: senderNumber,
                    isGroup,
                    isOwner: senderNumber === config.ownerNumber,
                    args,
                    text: args.join(' '),
                    msg,
                    config,
                    prefix
                });
            } catch (err) {
                console.error(`${colors.red}[!]${colors.reset} Erro no comando ${commandName}:`, err);
                await sock.sendMessage(from, { text: `❌ Erro ao executar comando: ${err.message}` });
            }
        }
    });

    // Call handler (bloquear chamadas)
    sock.ev.on('call', async ([call]) => {
        if (config.rejectCalls) {
            await sock.rejectCall(call.id, call.from);
        }
    });
}

startBot().catch(err => {
    console.error(`${colors.red}[!]${colors.reset} Erro fatal:`, err);
    process.exit(1);
});
