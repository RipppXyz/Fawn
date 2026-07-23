export default {
  name: "ping",

  async execute(sock, jid, args, msg) {
    await sock.sendMessage(
      jid,
      { text: "🏓 Pong!" },
      { quoted: msg }
    );
  }
};