import { generateFakeChatIphone } from "generator-fake";

export default {
  name: "iqc",

  async execute(sock, jid, args, msg) {
    const text = args.join(" ").trim();

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "Contoh:\n.iqc halo bro" },
        { quoted: msg }
      );
    }

    try {
      const now = new Date();

      const time = now.toLocaleTimeString(
        "id-ID",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }
      );

      const image = await generateFakeChatIphone({
        text,
        chatTime: time,
        statusBarTime: time
      });

      await sock.sendMessage(
        jid,
        { image },
        { quoted: msg }
      );
    } catch (error) {
      console.error("❌ IQC error:", error);

      await sock.sendMessage(
        jid,
        {
          text: "❌ Gagal membuat IQC.\n\n" + error.message
        },
        { quoted: msg }
      );
    }
  }
};