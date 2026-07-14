/**
 * Sticker conversion helpers.
 * Uses sharp (image) + fluent-ffmpeg (animated/video) to produce
 * WhatsApp-compatible webp stickers, and to convert stickers back
 * into a plain image.
 */
"use strict";

const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

function tmpFile(ext) {
  return path.join(os.tmpdir(), `${crypto.randomUUID()}.${ext}`);
}

/** Converts a static image buffer into a WhatsApp sticker (webp) buffer. */
async function imageToWebpSticker(buffer) {
  return sharp(buffer)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 80 })
    .toBuffer();
}

/** Converts a short video/gif buffer into an animated WhatsApp sticker (webp). */
async function videoToWebpSticker(buffer) {
  const inputPath = tmpFile("mp4");
  const outputPath = tmpFile("webp");
  fs.writeFileSync(inputPath, buffer);

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-vcodec", "libwebp",
        "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
        "-loop", "0",
        "-preset", "default",
        "-an",
        "-vsync", "0",
        "-t", "6",
      ])
      .toFormat("webp")
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });

  const result = fs.readFileSync(outputPath);
  fs.rmSync(inputPath, { force: true });
  fs.rmSync(outputPath, { force: true });
  return result;
}

/** Converts a sticker (webp) buffer back into a plain PNG image buffer. */
async function webpToImage(buffer) {
  return sharp(buffer).png().toBuffer();
}

module.exports = { imageToWebpSticker, videoToWebpSticker, webpToImage };
