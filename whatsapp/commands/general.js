/**
 * 🌸 PRETTY GIRL MD - General Utility Commands
 * 💕 Créé par DEV SHADOW TECH
 * General utility commands available to every user.
 */
"use strict";

const config = require("../../config/config");
const pkg = require("../../package.json");

const startedAt = Date.now();

function formatUptime(ms) {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

const menuText = (ctx) => `
╭─────────────────────────────❖
│        🌸  PRETTY GIRL MD  🌸
│      💕  ${config.whatsapp.botName.toUpperCase()}  💕
│      👨‍💻  Créé par DEV SHADOW TECH
╰─────────────────────────────❖

┏━━━〔 👤 USER INFO 〕━━━⬣
┃➤ 🧑 Name    : ${ctx.senderName}
┃➤ 💎 Status  : ${ctx.isOwner ? "OWNER 👑" : ctx.isPremium ? "PREMIUM ✨" : "FREE 👤"}
┃➤ 📦 Version : ${pkg.version}
┃➤ ⚡ Prefix  : .
┗━━━━━━━━━━━━━━━━━━⬣

┏━━━〔 ⚙️ GENERAL MENU 〕━━━⬣
┃◈ .menu
┃◈ .ping
┃◈ .runtime
┗━━━━━━━━━━━━━━━━━━⬣

┏━━━〔 🎭 MEDIA MENU 〕━━━⬣
┃◈ .sticker
┃◈ .toimg
┗━━━━━━━━━━━━━━━━━━⬣

┏━━━〔 👥 GROUP MENU 〕━━━⬣
┃◈ .kick
┃◈ .promote
┃◈ .demote
┃◈ .groupinfo
┗━━━━━━━━━━━━━━━━━━⬣

${
ctx.isOwner
? `┏━━━〔 👑 OWNER MENU 〕━━━⬣
┃◈ .addprem <number> <days>
┃◈ .delprem <number>
┃◈ .broadcast <text>
┗━━━━━━━━━━━━━━━━━━⬣`
: ""
}

╭─────────────────────────────❖
│ ⚡ Speed  : ${ping || "0"} ms
│ 🚀 Engine : NodeJS
│ 🟢 Status : ONLINE
│ 🌸 PRETTY GIRL MD v${pkg.version}
│ 💕 Créé par DEV SHADOW TECH
╰─────────────────────────────❖
`;

const commands = {
  menu: async (ctx) => ctx.reply(menuText(ctx)),

  ping: async (ctx) => {
    const start = Date.now();
    await ctx.reply("🏓 Pinging PRETTY GIRL MD... 💕");
    const latency = Date.now() - start;
    return ctx.reply(`🏓 Pong! ${latency}ms ✨`);
  },

  runtime: async (ctx) => ctx.reply(`⏱ Uptime: ${formatUptime(Date.now() - startedAt)} 💕`),
};

module.exports = { commands };