export default {
  name: "help",

  async execute(sock, jid, args, msg) {
    const text = `╭─〔 🦌 FAWN BOT 〕
│
├ 🛠️ UTILITY
│ • .ping
│ • .help
│ • .menu
│
├ 🎨 MAKER
│ • .brat teks
│ • .bratvid teks
│ • .iqc teks
│ • .s
│
╰────────────────`;

    await sock.sendMessage(
      jid,
      { text },
      { quoted: msg }
    );
  }
};