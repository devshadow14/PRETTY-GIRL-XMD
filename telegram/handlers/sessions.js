/**
 * 🌸 PRETTY GIRL MD - Session Handlers
 * 💕 Créé par DEV SHADOW TECH
 * /sessions, /logout, /restart handlers + their inline-keyboard actions.
 * Regular users only see/manage their OWN sessions; owners can see all.
 */
"use strict";

const waManager = require("../../whatsapp/manager");
const { sessions: sessionsTable } = require("../../database/db");
const { isOwner } = require("../utils/auth");
const { sessionsList, sessionActions, confirm } = require("../keyboards/mainMenu");
const { statusEmoji } = require("../utils/format");

function visibleSessions(telegramId) {
  const all = waManager.listSessions();
  if (isOwner(telegramId)) return all;
  return all.filter((s) => s.telegramOwnerId === String(telegramId));
}

function sessionSummary(s) {
  return (
    `${statusEmoji(s.status)} *${s.phoneNumber || "unknown"}*\n` +
    `   ID: \`${s.id}\`\n` +
    `   Status: ${s.status}\n`
  );
}

function registerSessionHandlers(bot) {
  const showSessions = async (ctx, edit = false) => {
    const list = visibleSessions(ctx.from.id);
    const text = list.length
      ? `📱 *PRETTY GIRL MD - Your Sessions* (${list.length}) 💕\n\n` + list.map(sessionSummary).join("\n")
      : "📱 You have no active sessions yet. Use /pair to link one. 💕";

    const payload = { parse_mode: "Markdown", ...sessionsList(list) };
    return edit ? ctx.editMessageText(text, payload) : ctx.reply(text, payload);
  };

  bot.command("sessions", async (ctx) => showSessions(ctx, false));
  bot.action("menu:sessions", async (ctx) => {
    await ctx.answerCbQuery();
    return showSessions(ctx, true);
  });

  bot.action(/session:view:(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const sessionId = ctx.match[1];
    const session = waManager.listSessions().find((s) => s.id === sessionId);
    if (!session) return ctx.editMessageText("⚠️ Session not found. 💕");

    return ctx.editMessageText(
      `📱 *PRETTY GIRL MD - Session Details* 💕\n\n${sessionSummary(session)}   Created: ${new Date(
        session.createdAt
      ).toLocaleString()}`,
      { parse_mode: "Markdown", ...sessionActions(sessionId) }
    );
  });

  bot.action(/session:restart:(.+)/, async (ctx) => {
    await ctx.answerCbQuery("Restarting PRETTY GIRL MD session... 🌸");
    const sessionId = ctx.match[1];
    try {
      await waManager.restartSession(sessionId);
      return ctx.editMessageText(`🔄 PRETTY GIRL MD - Session \`${sessionId}\` is restarting... ✨`, { parse_mode: "Markdown" });
    } catch (err) {
      return ctx.editMessageText(`⚠️ Failed to restart: ${err.message} 💕`);
    }
  });

  bot.action(/session:logout:(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const sessionId = ctx.match[1];
    return ctx.editMessageText(
      `⚠️ Are you sure you want to log out PRETTY GIRL MD session \`${sessionId}\`? This deletes its saved credentials. 💕`,
      { parse_mode: "Markdown", ...confirm(`session:logout:confirm:${sessionId}`, "menu:sessions") }
    );
  });

  bot.action(/session:logout:confirm:(.+)/, async (ctx) => {
    await ctx.answerCbQuery("Logging out PRETTY GIRL MD session... 💕");
    const sessionId = ctx.match[1];
    try {
      await waManager.logoutSession(sessionId);
      return ctx.editMessageText(`🗑 PRETTY GIRL MD - Session \`${sessionId}\` logged out and removed. 🌸`, { parse_mode: "Markdown" });
    } catch (err) {
      return ctx.editMessageText(`⚠️ Failed to logout: ${err.message} 💕`);
    }
  });

  // Standalone /logout and /restart commands (operate on the user's only
  // session if they have exactly one, otherwise point them to /sessions).
  bot.command("logout", async (ctx) => {
    const list = visibleSessions(ctx.from.id);
    if (list.length === 0) return ctx.reply("ℹ️ You have no sessions to log out. 💕");
    if (list.length > 1) return showSessions(ctx, false);
    await waManager.logoutSession(list[0].id);
    return ctx.reply(`🗑 PRETTY GIRL MD - Session \`${list[0].id}\` logged out. 🌸`, { parse_mode: "Markdown" });
  });

  bot.command("restart", async (ctx) => {
    const list = visibleSessions(ctx.from.id);
    if (list.length === 0) return ctx.reply("ℹ️ You have no sessions to restart. 💕");
    if (list.length > 1) return showSessions(ctx, false);
    await waManager.restartSession(list[0].id);
    return ctx.reply(`🔄 PRETTY GIRL MD - Session \`${list[0].id}\` restarting... ✨`, { parse_mode: "Markdown" });
  });

  bot.action("menu:restart", async (ctx) => {
    await ctx.answerCbQuery();
    return showSessions(ctx, true);
  });
  bot.action("menu:logout", async (ctx) => {
    await ctx.answerCbQuery();
    return showSessions(ctx, true);
  });
}

module.exports = { registerSessionHandlers };