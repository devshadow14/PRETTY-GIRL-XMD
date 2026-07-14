/**
 * 🌸 PRETTY GIRL MD - Pairing Handlers
 * 💕 Créé par DEV SHADOW TECH
 * Pairing flow:
 *   /pair -> bot asks for WhatsApp number -> user sends number ->
 *   pairing code generated -> shown to user -> wait for connection ->
 *   session saved automatically -> success notification.
 *
 * State is tracked per Telegram user in-memory (a user can only have
 * one pairing flow in progress at a time).
 */
"use strict";

const crypto = require("crypto");
const waManager = require("../../whatsapp/manager");
const { sessions: sessionsTable } = require("../../database/db");
const config = require("../../config/config");

/** telegramId -> "awaiting_number" */
const pendingPairings = new Map();

function newSessionId() {
  return crypto.randomUUID().slice(0, 8);
}

function registerPairingHandlers(bot) {
  bot.action("menu:pair", async (ctx) => {
    await ctx.answerCbQuery();
    return startPairing(ctx);
  });

  bot.command("pair", async (ctx) => startPairing(ctx));

  // Listens for the phone number once a pairing flow is pending.
  bot.on("text", async (ctx, next) => {
    const telegramId = String(ctx.from.id);
    if (pendingPairings.get(telegramId) !== "awaiting_number") {
      return next();
    }

    const rawNumber = ctx.message.text.trim();
    const phoneNumber = rawNumber.replace(/[^0-9]/g, "");

    if (phoneNumber.length < 8) {
      return ctx.reply("⚠️ That doesn't look like a valid number. Send it with country code, e.g. 628123456789 💕");
    }

    pendingPairings.delete(telegramId);

    const existingCount = sessionsTable.filter(
      (s) => s.telegramOwnerId === telegramId && s.status !== "logged-out"
    ).length;
    if (existingCount >= config.maxSessions) {
      return ctx.reply(`⚠️ You've reached the maximum of ${config.maxSessions} sessions. Logout an existing one first. 💕`);
    }

    const sessionId = newSessionId();
    await ctx.reply(`⏳ PRETTY GIRL MD - Requesting pairing code for *${phoneNumber}*... 🌸`, { parse_mode: "Markdown" });

    try {
      await waManager.startSession(sessionId, { phoneNumber, telegramOwnerId: telegramId });
    } catch (err) {
      return ctx.reply(`⚠️ Failed to start pairing: ${err.message} 💕`);
    }
  });
}

async function startPairing(ctx) {
  const telegramId = String(ctx.from.id);
  pendingPairings.set(telegramId, "awaiting_number");
  return ctx.reply(
    "📱 Send your WhatsApp number including country code, no spaces or symbols.\n\nExample: `628123456789`\n\n💕 PRETTY GIRL MD - Créé par DEV SHADOW TECH",
    { parse_mode: "Markdown" }
  );
}

module.exports = { registerPairingHandlers };