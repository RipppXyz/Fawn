import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "baileys";

import P from "pino";
import fs from "fs";
import path from "path";
import {
  fileURLToPath,
  pathToFileURL
} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PHONE_NUMBER = "6285779146503";
const AUTH_FOLDER = "./auth_info";
const commands = new Map();

async function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");

  const files = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

  for (const file of files) {
    try {
      const filePath = path.join(commandsPath, file);
      const commandModule = await import(pathToFileURL(filePath).href);
      const command = commandModule.default;

      if (!command?.name || !command?.execute) {
        console.log(`⚠️ Command invalid: ${file}`);
        continue;
      }

      commands.set(command.name.toLowerCase(), command);
      console.log(`✅ Command loaded: .${command.name}`);
    } catch (error) {
      console.error(`❌ Gagal load command ${file}:`, error.message);
    }
  }

  console.log(`📦 Total command: ${commands.size}`);
}

async function startBot() {
  await loadCommands();

  const { state, saveCreds } =
    await useMultiFileAuthState(AUTH_FOLDER);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  let pairingRequested = false;

  sock.ev.on("connection.update", async update => {
    const { connection, lastDisconnect } = update;

    console.log("Connection:", connection || "waiting");

    if (
      connection === "connecting" &&
      !state.creds.registered &&
      !pairingRequested
    ) {
      pairingRequested = true;

      try {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const code = await sock.requestPairingCode(PHONE_NUMBER);

        console.log("\n==============================");
        console.log("🔐 PAIRING CODE:");
        console.log(code);
        console.log("==============================");
        console.log("Masukkan kode di WhatsApp.");
        console.log("⚠️ Jangan restart bot.\n");
      } catch (error) {
        console.error("❌ Pairing error:", error);
      }
    }

    if (connection === "open") {
      console.log("\n=================================");
      console.log("✅ FAWN BOT TERHUBUNG!");
      console.log("=================================\n");
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode;

      console.log("❌ Koneksi terputus:", statusCode);

      if (statusCode === DisconnectReason.loggedOut) {
        console.log("⚠️ Session logout.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const jid = msg.key.remoteJid;

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        "";

      const parts = text.trim().split(/\s+/);
      const commandName = parts
        .shift()
        ?.toLowerCase()
        .replace(/^\./, "");

      if (!commandName) continue;

      const command = commands.get(commandName);
      if (!command) continue;

      try {
        await sock.sendMessage(jid, {
          react: { text: "⏳", key: msg.key }
        });

        await command.execute(sock, jid, parts, msg);

        await sock.sendMessage(jid, {
          react: { text: "✅", key: msg.key }
        });
      } catch (error) {
        console.error(`❌ Error command .${commandName}:`, error);

        await sock.sendMessage(jid, {
          react: { text: "❌", key: msg.key }
        });

        await sock.sendMessage(jid, {
          text: "❌ Terjadi error saat menjalankan command."
        });
      }
    }
  });
}

startBot().catch(error => {
  console.error("❌ ERROR FATAL:");
  console.error(error);
});
