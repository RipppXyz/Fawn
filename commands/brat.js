import { brat } from "brat-canvas";

export default {
  name: "brat",

  async execute(sock, jid, args, msg) {
    const text = args.join(" ").trim();

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "Contoh:\n.brat aku suka coding" },
        { quoted: msg }
      );
    }

    try {
      const buffer = await brat(text);

      await sock.sendMessage(
        jid,
        { sticker: buffer },
        { quoted: msg }
      );
    } catch (error) {
      console.error("❌ Brat error:", error);

      await sock.sendMessage(
        jid,
        { text: "❌ Gagal membuat Brat." },
        { quoted: msg }
      );
    }
  }
};