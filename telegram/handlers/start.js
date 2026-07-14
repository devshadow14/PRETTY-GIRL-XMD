/**
 * 🌸 PRETTY GIRL MD - Start Handlers
 * 💕 Créé par DEV SHADOW TECH
 * /start, /menu, /help handlers.
 */
"use strict";

const { mainMenu } = require("../keyboards/mainMenu");
const { isOwner, registerUser } = require("../utils/auth");
const config = require("../../config/config");

const WELCOME = (name) => `
━━━━━━━━━━━━━━━━━━
🌸 *PRETTY GIRL MD* 🌸
💕 ${config.whatsapp.botName.toUpperCase()} CONTROL PANEL 💕
👨‍💻 Créé par DEV SHADOW TECH
━━━━━━━━━━━━━━━━━━
Hi ${name} 👋

This bot remotely manages your WhatsApp bot session — pairing,
sessions, status, and (if you're the owner) full admin controls.

Use the buttons below or these commands:
/pair — link a WhatsApp number
/sessions — manage your sessions
/status — bot health
/logout — disconnect a session
/restart — restart a session
/help — full command list
━━━━━━━━━━━━━━━━━━
`;

const HELP_TEXT = `
🌸 *PRETTY GIRL MD - Help* 💕
👨‍💻 Créé par DEV SHADOW TECH

*Available Commands*

/start — show the welcome message
/menu — open the control panel
/pair — link a new WhatsApp number
/sessions — list and manage your sessions
/status — bot + session health
/restart — restart a session
/logout — disconnect and remove a session
/users — (owner) list bot users
/help — this message
💕 *Powered by PRETTY GIRL MD*
`;

function registerStartHandlers(bot) {
  bot.start(async (ctx) => {
    registerUser(ctx.from.id, { username: ctx.from.username });
    return ctx.reply(WELCOME(ctx.from.first_name || "there"), {
      parse_mode: "Markdown",
      ...mainMenu(isOwner(ctx.from.id)),
    });
  });

  bot.command("menu", async (ctx) =>
    ctx.reply("🌸 *PRETTY GIRL MD - Control Panel* 💕", {
      parse_mode: "Markdown",
      ...mainMenu(isOwner(ctx.from.id)),
    })
  );

  bot.action("menu:main", async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.editMessageText("🌸 *PRETTY GIRL MD - Control Panel* 💕", {
      parse_mode: "Markdown",
      ...mainMenu(isOwner(ctx.from.id)),
    });
  });

  bot.command("help", async (ctx) => ctx.reply(HELP_TEXT, { parse_mode: "Markdown" }));
}

module.exports = { registerStartHandlers };