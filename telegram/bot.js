/**
 * 🌸 PRETTY GIRL MD - Telegram Bot Bootstrap
 * 💕 Créé par DEV SHADOW TECH
 * Telegram Bot bootstrap.
 * Wires every handler module onto a single Telegraf instance and
 * applies a global authorization gate (only owners + approved users
 * may interact with the panel at all).
 */
"use strict";

const { Telegraf } = require("telegraf");
const config = require("../config/config");
const { isAuthorized, registerUser } = require("./utils/auth");

const { registerStartHandlers } = require("./handlers/start");
const { registerPairingHandlers } = require("./handlers/pair");
const { registerSessionHandlers } = require("./handlers/sessions");
const { registerStatusHandlers } = require("./handlers/status");
const { registerOwnerHandlers } = require("./handlers/owner");
const { registerSettingsHandlers } = require("./handlers/settings");
const { bridgeWhatsAppEvents } = require("./events/waEvents");

function createBot() {
  if (!config.telegram.botToken) {
    throw new Error(
      "🌸 PRETTY GIRL MD - TELEGRAM_BOT_TOKEN is not set. Copy .env.example to .env and fill it in before starting. 💕"
    );
  }

  const bot = new Telegraf(config.telegram.botToken);

  // ---- Global authorization gate ----
  bot.use(async (ctx, next) => {
    if (!ctx.from) return next();

    // /start is always allowed so new users can request access.
    const isStartCommand = ctx.message?.text === "/start" || ctx.updateType === "callback_query" && ctx.update.callback_query.data === "menu:main";
    registerUser(ctx.from.id, { username: ctx.from.username });

    if (!isAuthorized(ctx.from.id) && !isStartCommand) {
      return ctx.reply("⛔ You are not authorized to use PRETTY GIRL MD yet. Ask the owner to approve your account. 💕");
    }
    return next();
  });

  registerStartHandlers(bot);
  registerPairingHandlers(bot);
  registerSessionHandlers(bot);
  registerStatusHandlers(bot);
  registerOwnerHandlers(bot);
  registerSettingsHandlers(bot);
  bridgeWhatsAppEvents(bot);

  bot.catch((err, ctx) => {
    console.error(`[🌸 PRETTY GIRL MD - Telegram] Unhandled error for update ${ctx.updateType}:`, err);
  });

  console.log(`🌸 PRETTY GIRL MD - Telegram bot initialized successfully ✨`);
  console.log(`💕 Créé par DEV SHADOW TECH`);

  return bot;
}

module.exports = { createBot };