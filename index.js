import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@itsliaaa/baileys";
import P from "pino";

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("🤖 ROBÔ CONECTADO!");
    }

    if (connection === "close") {
      const deveReconectar =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (deveReconectar) {
        iniciarBot();
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const texto =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    const comando = texto.trim().toLowerCase();

    if (comando === ".ping") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "🏓 Pong! O robô está funcionando! 🤖"
      });
    }

    if (comando === ".oi") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "Olá! 👋 Eu sou o robô do grupo 🤖"
      });
    }

    if (comando === ".menu") {
      await sock.sendMessage(msg.key.remoteJid, {
        text:
          "🤖 *MENU DO ROBÔ*\n\n" +
          "🏓 .ping\n" +
          "👋 .oi\n" +
          "📋 .regras\n" +
          "ℹ️ .info\n" +
          "🕐 .hora"
      });
    }

    if (comando === ".regras") {
      await sock.sendMessage(msg.key.remoteJid, {
        text:
          "📋 *REGRAS DO GRUPO*\n\n" +
          "1. Respeitar todos.\n" +
          "2. Não enviar spam.\n" +
          "3. Não enviar conteúdo proibido.\n" +
          "4. Evitar discussões desnecessárias."
      });
    }

    if (comando === ".info") {
      await sock.sendMessage(msg.key.remoteJid, {
        text:
          "🤖 *INFORMAÇÕES*\n\n" +
          "Nome: Meu Bot WhatsApp\n" +
          "Versão: 1.0\n" +
          "Status: Online ✅"
      });
    }

    if (comando === ".hora") {
      const hora = new Date().toLocaleTimeString("pt-MZ");

      await sock.sendMessage(msg.key.remoteJid, {
        text: `🕐 Hora atual: ${hora}`
      });
    }
  });
}

iniciarBot();
