export default {
  name: "menu",

  async execute(sock, jid, args, msg) {
    const text = `🦌 *FAWN BOT*

╭─〔 COMMANDS 〕
│
│ .ping
│ .help
│ .menu
│
│ .brat teks
│ .bratvid teks
│ .iqc teks
│ .s
│
╰────────────────`;

    await sock.sendMessage(
      jid,
      { text },
      { quoted: msg }
    );
  }
};