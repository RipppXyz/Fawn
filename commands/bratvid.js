import { bratVid } from "brat-canvas/video";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";

export default {
  name: "bratvid",

  async execute(sock, jid, args, msg) {
    const text = args.join(" ").trim();

    if (!text) {
      return sock.sendMessage(
        jid,
        { text: "Contoh:\n.bratvid aku suka coding" },
        { quoted: msg }
      );
    }

    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "fawn-bratvid-")
    );

    const inputPath = path.join(tempDir, "input.mp4");
    const outputPath = path.join(tempDir, "output.webp");

    try {
      console.log("🎬 Membuat BratVid...");

      const video = await bratVid(text, {
        outputFormat: "mp4",
        fast_progress: true,
        lyric: {
          maxWordPerLayer: 4,
          frameDuration: 0.85,
          lastFrameDuration: 2
        },
        brat: {
          BLUR: 0
        }
      });

      fs.writeFileSync(inputPath, video);

      await new Promise((resolve, reject) => {
        const ffmpeg = spawn(ffmpegPath, [
          "-y",
          "-i", inputPath,
          "-vf",
          "fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white",
          "-loop", "0",
          "-an",
          "-c:v", "libwebp",
          "-quality", "70",
          "-compression_level", "4",
          outputPath
        ]);

        let errorOutput = "";

        ffmpeg.stderr.on("data", data => {
          errorOutput += data.toString();
        });

        ffmpeg.on("error", reject);

        ffmpeg.on("close", code => {
          if (code === 0) resolve();
          else reject(new Error(errorOutput));
        });
      });

      const stickerBuffer = fs.readFileSync(outputPath);

      await sock.sendMessage(
        jid,
        { sticker: stickerBuffer },
        { quoted: msg }
      );
    } catch (error) {
      console.error("❌ BratVid error:", error);

      await sock.sendMessage(
        jid,
        {
          text: "❌ Gagal membuat BratVid.\n\n" + error.message
        },
        { quoted: msg }
      );
    } finally {
      fs.rmSync(tempDir, {
        recursive: true,
        force: true
      });
    }
  }
};