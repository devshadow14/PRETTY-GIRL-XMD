/**
 * 🌸 PRETTY GIRL MD - Owner Panel Handlers
 * 💕 Créé par DEV SHADOW TECH
 * Owner-only panel: broadcast, restart, shutdown, logs, users, stats.
 * All handlers here double-check isOwner even though the keyboard
 * button is hidden from non-owners, since callback data can in theory
 * be replayed by anyone.
 */
"use strict";

const os = require("os");
const fs = require("fs");
const path = require("path");
const waManager = require("../../whatsapp/manager");
const { users } = require("../../database/db");
const { isOwner, isPrimaryOwner } = require("../utils/auth");
const { ownerPanel, confirm } = require("../keyboards/mainMenu");
const { formatUptime, formatBytes } = require("../utils/format");
const config = require("../../config/config");

const bootTime = Date.now();
const LOG_PATH = path.join(config.paths.root, "pretty-girl-md.log");

/** telegramId -> "awaiting_broadcast" */
const pendingBroadcast = new Map();

function guardOwner(ctx) {
  if (!isOwner(ctx.from.id)) {
    ctx.reply("⛔ Owner only. 👑");
    return false;
  }
  return true;
}

function registerOwnerHandlers(bot) {
  bot.command("users", async (ctx) => {
    if (!guardOwner(ctx)) return;
    return sendUsersList(ctx);
  });

  bot.action("menu:owner", async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx.from.id)) return;
    return ctx.editMessageText("👑 *PRETTY GIRL MD - Owner Panel* 💕", { parse_mode: "Markdown", ...ownerPanel() });
  });

  bot.action("owner:users", async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx.from.id)) return;
    return sendUsersList(ctx, true);
  });

  bot.action("owner:stats", async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx.from.id)) return;
    return sendStats(ctx, true);
  });

  bot.action("owner:logs", async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx.from.id)) return;
    return sendLogs(ctx);
  });

  bot.action("owner:broadcast", async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx.from.id)) return;
    pendingBroadcast.set(String(ctx.from.id), true);
    return ctx.editMessageText("📢 Send the message you want to broadcast to *all PRETTY GIRL MD users*. 💕", {
      parse_mode: "Markdown",
    });
  });

  bot.action("owner:restart", async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx.from.id)) return;
    return ctx.editMessageText("⚠️ Restart PRETTY GIRL MD panel process?", {
      ...confirm("owner:restart:confirm", "menu:owner"),
    });
  });

  bot.action("owner:restart:confirm", async (ctx) => {
    await ctx.answerCbQuery();
    if (!isPrimaryOwner(ctx.from.id)) return;
    await ctx.editMessageText("🔄 Restarting PRETTY GIRL MD... 🌸");
    setTimeout(() => process.exit(0), 500);
  });

  bot.action("owner:shutdown", async (ctx) => {
    await ctx.answerCbQuery();
    if (!isOwner(ctx.from.id)) return;
    return ctx.editMessageText("⛔ Shut down PRETTY GIRL MD? This stops ALL WhatsApp sessions. 💕", {
      ...confirm("owner:shutdown:confirm", "menu:owner"),
    });
  });

  bot.action("owner:shutdown:confirm", async (ctx) => {
    await ctx.answerCbQuery();
    if (!isPrimaryOwner(ctx.from.id)) return;
    await ctx.editMessageText("⛔ PRETTY GIRL MD shutting down... 💕");
    setTimeout(() => process.exit(0), 500);
  });

  bot.command("broadcast", async (ctx) => {
    if (!guardOwner(ctx)) return;
    const message = ctx.message.text.split(" ").slice(1).join(" ");
    if (!message) return ctx.reply("⚠️ Usage: /broadcast <message> 💕");
    return runBroadcast(ctx, message);
  });

  bot.on("text", async (ctx, next) => {
    const telegramId = String(ctx.from.id);
    if (!pendingBroadcast.get(telegramId)) return next();
    pendingBroadcast.delete(telegramId);
    return runBroadcast(ctx, ctx.message.text);
  });
}

async function runBroadcast(ctx, message) {
  const all = users.all();
  let sent = 0;
  for (const u of all) {
    try {
      await ctx.telegram.sendMessage(u.telegramId, `📢 *PRETTY GIRL MD - Announcement* 🌸\n\n${message}\n\n💕 Créé par DEV SHADOW TECH`, { parse_mode: "Markdown" });
      sent++;
    } catch {
      // user may have blocked the bot — skip
    }
  }
  return ctx.reply(`✅ Broadcast delivered to ${sent}/${all.length} user(s). ✨`);
}

async function sendUsersList(ctx, edit = false) {
  const all = users.all();
  const text = all.length
    ? `👥 *PRETTY GIRL MD Users* (${all.length}) 💕\n\n` +
      all.map((u) => `• ${u.username ? "@" + u.username : u.telegramId} ${u.approved ? "✅" : "⏳"}`).join("\n")
    : "👥 No users yet. 💕";
  const payload = { parse_mode: "Markdown" };
  return edit ? ctx.editMessageText(text, payload) : ctx.reply(text, payload);
}

async function sendStats(ctx, edit = false) {
  const sessions = waManager.listSessions();
  const connected = sessions.filter((s) => s.status === "connected").length;
  const mem = process.memoryUsage();
  const cpus = os.cpus();
  const loadAvg = os.loadavg();

  const text = `
📈 *PRETTY GIRL MD - Statistics* 💕

◇ Uptime: ${formatUptime(Date.now() - bootTime)}
◇ Total Sessions: ${sessions.length} (${connected} connected)
◇ Total Users: ${users.all().length}
◇ Memory (RSS): ${formatBytes(mem.rss)}
◇ Heap Used: ${formatBytes(mem.heapUsed)}
◇ CPU Cores: ${cpus.length}
◇ Load Avg: ${loadAvg.map((n) => n.toFixed(2)).join(", ")}
◇ Bot: PRETTY GIRL MD v5.0.0
◇ Créé par DEV SHADOW TECH
`;
  const payload = { parse_mode: "Markdown" };
  return edit ? ctx.editMessageText(text, payload) : ctx.reply(text, payload);
}

async function sendLogs(ctx) {
  if (!fs.existsSync(LOG_PATH)) {
    return ctx.editMessageText("📄 No logs recorded yet. 💕");
  }
  const content = fs.readFileSync(LOG_PATH, "utf-8");
  const tail = content.split("\n").slice(-30).join("\n") || "(empty)";
  return ctx.editMessageText(`📄 *PRETTY GIRL MD - Last 30 log lines* 💕\n\n\`\`\`\n${tail.slice(-3500)}\n\`\`\``, {
    parse_mode: "Markdown",
  });
}

module.exports = { registerOwnerHandlers };