/**
 * 🌸 PRETTY GIRL MD - WhatsApp Message Handler
 * 💕 Créé par DEV SHADOW TECH
 * ----------------------------------------------------------------
 * Parses every incoming message, resolves sender/command/args, and
 * dispatches to the right command module. This replaces the original
 * XnelTrazix.js dispatcher — same parsing approach (prefix detection,
 * owner/premium checks) but the command set is now a legitimate
 * utility + media bot instead of an attack tool.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const { isPremium } = require("./commands/premium");

const generalCommands = require("./commands/general");
const ownerCommands = require("./commands/owner");
const groupCommands = require("./commands/group");
const mediaCommands = require("./commands/media");

const THUMBNAIL_PATH = path.join(config.paths.media, "thumbnail.jpg");

function extractBody(msg) {
  const message = msg.message;
  if (!message) return "";
  if (message.conversation) return message.conversation;
  if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
  if (message.imageMessage?.caption) return message.imageMessage.caption;
  if (message.videoMessage?.caption) return message.videoMessage.caption;
  return "";
}

function buildReply(sock, msg) {
  return async (text, extra = {}) => {
    const payload = { text, ...extra };

    // Attach branded preview only for plain text replies.
    if (!extra.image && !extra.video && !extra.sticker) {
      payload.contextInfo = {
        externalAdReply: {
          title: `🌸 PRETTY GIRL MD - ${config.whatsapp.botName}`,
          body: "💕 WhatsApp Utility Bot | Créé par DEV SHADOW TECH",
          previewType: "PHOTO",
          thumbnail: fs.existsSync(THUMBNAIL_PATH) ? fs.readFileSync(THUMBNAIL_PATH) : undefined,
          mediaType: 1,
        },
        ...extra.contextInfo,
      };
    }

    return sock.sendMessage(msg.key.remoteJid, payload, { quoted: msg });
  };
}

/** All command modules registered here, in lookup order. */
const registry = [generalCommands, ownerCommands, groupCommands, mediaCommands];

async function handleIncomingMessage(sock, msg) {
  if (!msg.message || msg.key.remoteJid === "status@broadcast") return;

  const body = extractBody(msg);
  if (!body) return;

  const usedPrefix = config.whatsapp.prefix.find((p) => body.startsWith(p));
  if (usedPrefix === undefined) return;

  const withoutPrefix = body.slice(usedPrefix.length).trim();
  if (!withoutPrefix) return;

  const [rawCommand, ...args] = withoutPrefix.split(/\s+/);
  const command = rawCommand.toLowerCase();

  const sender = msg.key.fromMe ? sock.user.id : msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split("@")[0].split(":")[0];
  const isOwner = config.whatsapp.ownerNumbers.includes(senderNumber);
  const isGroup = msg.key.remoteJid.endsWith("@g.us");

  const ctx = {
    sock,
    msg,
    command,
    args,
    text: args.join(" "),
    sender,
    senderNumber,
    senderName: msg.pushName || "User",
    isOwner,
    isPremium: isPremium(senderNumber),
    isGroup,
    reply: buildReply(sock, msg),
  };

  if (isGroup) {
    try {
      ctx.groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
    } catch {
      ctx.groupMetadata = null;
    }
  }

  console.log(`🌸 PRETTY GIRL MD - Command: ${command} from ${senderName} (${senderNumber})`);

  for (const module of registry) {
    const handler = module.commands[command];
    if (!handler) continue;
    try {
      await handler(ctx);
    } catch (err) {
      console.error(`[🌸 PRETTY GIRL MD:${command}] error:`, err);
      await ctx.reply(`⚠️ An error occurred while running *${command}*. 💕`);
    }
    return; // command matched and handled — stop looking
  }
}

module.exports = { handleIncomingMessage };