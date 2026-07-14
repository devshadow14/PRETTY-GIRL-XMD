/**
 * 🌸 PRETTY GIRL MD - Settings Handlers
 * 💕 Créé par DEV SHADOW TECH
 * ⚙ Settings — lightweight panel for per-user preferences.
 * Currently exposes session limits info; structured so more toggles
 * can be added later without touching other handlers.
 */
"use strict";

const { Markup } = require("telegraf");
const config = require("../../config/config");
const waManager = require("../../whatsapp/manager");
const { isOwner } = require("../utils/auth");

function registerSettingsHandlers(bot) {
  bot.action("menu:settings", async (ctx) => {
    await ctx.answerCbQuery();
    const mySessions = waManager
      .listSessions()
      .filter((s) => isOwner(ctx.from.id) || s.telegramOwnerId === String(ctx.from.id));

    return ctx.editMessageText(
      `⚙ *PRETTY GIRL MD - Settings* 💕\n\n` +
        `◇ Bot Name: ${config.whatsapp.botName} 🌸\n` +
        `◇ Your Sessions: ${mySessions.length} / ${config.maxSessions}\n` +
        `◇ Telegram ID: \`${ctx.from.id}\`\n` +
        `◇ Version: 5.0.0\n` +
        `◇ Créé par DEV SHADOW TECH\n`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([[Markup.button.callback("⬅️ Back", "menu:main")]]),
      }
    );
  });
}

module.exports = { registerSettingsHandlers };