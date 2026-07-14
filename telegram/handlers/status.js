/**
 * 🌸 PRETTY GIRL MD - Status Handlers
 * 💕 Créé par DEV SHADOW TECH
 * /status handler — overall health of the panel + the user's sessions.
 */
"use strict";

const os = require("os");
const waManager = require("../../whatsapp/manager");
const { isOwner } = require("../utils/auth");
const { formatUptime, formatBytes, statusEmoji } = require("../utils/format");

const bootTime = Date.now();

function visibleSessions(telegramId) {
  const all = waManager.listSessions();
  if (isOwner(telegramId)) return all;
  return all.filter((s) => s.telegramOwnerId === String(telegramId));
}

function registerStatusHandlers(bot) {
  const showStatus = async (ctx, edit = false) => {
    const sessions = visibleSessions(ctx.from.id);
    const connected = sessions.filter((s) => s.status === "connected").length;

    const mem = process.memoryUsage();
    const text = `
📊 *PRETTY GIRL MD - Status Report* 💕

◇ Bot Uptime: ${formatUptime(Date.now() - bootTime)}
◇ Your Sessions: ${sessions.length} (${connected} connected)
◇ Memory Used: ${formatBytes(mem.rss)}
◇ Platform: ${os.platform()} (${os.arch()})
◇ Bot Version: 5.0.0
◇ Créé par DEV SHADOW TECH

${sessions.map((s) => `${statusEmoji(s.status)} ${s.phoneNumber || s.id} — ${s.status}`).join("\n") || "No sessions yet. 💕"}
`;
    return edit ? ctx.editMessageText(text, { parse_mode: "Markdown" }) : ctx.reply(text, { parse_mode: "Markdown" });
  };

  bot.command("status", async (ctx) => showStatus(ctx, false));
  bot.action("menu:status", async (ctx) => {
    await ctx.answerCbQuery();
    return showStatus(ctx, true);
  });
}

module.exports = { registerStatusHandlers };