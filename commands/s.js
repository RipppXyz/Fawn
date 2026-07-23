import sharp from "sharp";
import { downloadContentFromMessage } from "baileys";

export default {
  name: "s",

  async execute(sock, jid, args, msg) {
    try {
      const caption = args.join(" ").trim();
      let imageMessage = null;

      const quoted =
        msg.message?.extendedTextMessage
          ?.contextInfo
          ?.quotedMessage;

      if (quoted?.imageMessage) {
        imageMessage = quoted.imageMessage;
      }

      if (msg.message?.imageMessage) {
        imageMessage = msg.message.imageMessage;
      }

      if (!imageMessage) {
        return sock.sendMessage(
          jid,
          {
            text:
              "❌ Reply gambar atau kirim gambar dengan caption:\n\n" +
              ".s\n" +
              ".s teks meme"
          },
          { quoted: msg }
        );
      }

      const stream = await downloadContentFromMessage(
        imageMessage,
        "image"
      );

      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const imageBuffer = Buffer.concat(chunks);

      const baseImage = await sharp(imageBuffer)
        .resize(512, 512, {
          fit: "cover",
          position: "centre"
        })
        .png()
        .toBuffer();

      if (!caption) {
        const sticker = await sharp(baseImage)
          .webp({ quality: 95 })
          .toBuffer();

        return sock.sendMessage(
          jid,
          { sticker },
          { quoted: msg }
        );
      }

      const fontSize = 48;
      const strokeWidth = 4;

      const escapedText = caption
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

      const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <style>
    .meme {
      font-family: Impact, Haettenschweiler, "Arial Black", sans-serif;
      font-size: ${fontSize}px;
      font-weight: 900;
      fill: white;
      stroke: black;
      stroke-width: ${strokeWidth}px;
      paint-order: stroke fill;
      text-anchor: middle;
    }
  </style>
  <text x="256" y="${fontSize + 18}" class="meme">
    ${escapedText}
  </text>
</svg>`;

      const sticker = await sharp(baseImage)
        .composite([
          {
            input: Buffer.from(svg),
            top: 0,
            left: 0
          }
        ])
        .webp({ quality: 95 })
        .toBuffer();

      await sock.sendMessage(
        jid,
        { sticker },
        { quoted: msg }
      );
    } catch (error) {
      console.error("❌ S ERROR:", error);

      await sock.sendMessage(
        jid,
        {
          text: "❌ Gagal membuat sticker.\n\n" + error.message
        },
        { quoted: msg }
      );
    }
  }
};