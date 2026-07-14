/**
 * 🌸 PRETTY GIRL MD - WhatsApp Events Bridge
 * 💕 Créé par DEV SHADOW TECH
 * Bridges WhatsApp manager lifecycle events to Telegram notifications.
 * Kept separate from the pairing command handlers so the event-wiring
 * concern lives in its own module, per the requested project layout.
 */
"use strict";

const waManager = require("../../whatsapp/manager");

function bridgeWhatsAppEvents(bot) {
  waManager.on("pairing-code", ({ telegramOwnerId, code, phoneNumber }) => {
    if (!telegramOwnerId) return;
    bot.telegram
      .sendMessage(
        telegramOwnerId,
        `🔗 *PRETTY GIRL MD - Pairing Code* 🌸\n\n◇ Number: ${phoneNumber}\n◇ Code: \`${code}\`\n\nOpen WhatsApp → Linked Devices → Link with phone number, then enter this code.\n\n💕 Créé par DEV SHADOW TECH`,
        { parse_mode: "Markdown" }
      )
      .catch(() => {});
  });

  waManager.on("pairing-error", ({ telegramOwnerId, error }) => {
    if (!telegramOwnerId) return;
    bot.telegram
      .sendMessage(telegramOwnerId, `⚠️ PRETTY GIRL MD - Pairing failed: ${error} 💕`)
      .catch(() => {});
  });

  waManager.on("connected", ({ sessionId, telegramOwnerId }) => {
    if (!telegramOwnerId) return;
    bot.telegram
      .sendMessage(telegramOwnerId, `✅ PRETTY GIRL MD - WhatsApp session *${sessionId}* connected successfully! ✨\n\n💕 Créé par DEV SHADOW TECH`, {
        parse_mode: "Markdown",
      })
      .catch(() => {});
  });

  waManager.on("disconnected", ({ sessionId, telegramOwnerId }) => {
    if (!telegramOwnerId) return;
    bot.telegram
      .sendMessage(telegramOwnerId, `🟡 PRETTY GIRL MD - Session *${sessionId}* disconnected — attempting to reconnect... 🌸`, {
        parse_mode: "Markdown",
      })
      .catch(() => {});
  });

  waManager.on("logged-out", ({ sessionId, telegramOwnerId }) => {
    if (!telegramOwnerId) return;
    bot.telegram
      .sendMessage(telegramOwnerId, `🗑 PRETTY GIRL MD - Session *${sessionId}* was logged out and removed. 💕`, {
        parse_mode: "Markdown",
      })
      .catch(() => {});
  });
}

module.exports = { bridgeWhatsAppEvents };