/**
 * 🌸 PRETTY GIRL MD - Owner Commands
 * 💕 Créé par DEV SHADOW TECH
 * Owner-only commands, available from inside WhatsApp chats.
 * (Mirrors the original project's addprem/delprem naming so existing
 * muscle-memory / scripts referencing those commands keep working.)
 */
"use strict";

const { addPremium, removePremium, listPremium } = require("./premium");

const DAY_MS = 24 * 60 * 60 * 1000;

const commands = {
  addprem: async (ctx) => {
    if (!ctx.isOwner) return ctx.reply("⚠️ Owner only. 👑");
    const [number, days] = ctx.args;
    if (!number || !days) {
      return ctx.reply("⚠️ Format: .addprem <number> <days>\nExample: .addprem 628123456789 30 💕");
    }
    const cleanNumber = number.replace(/[^0-9]/g, "");
    addPremium(cleanNumber, Number(days) * DAY_MS);
    return ctx.reply(`✅ ${cleanNumber} is now Premium for ${days} day(s). ✨`);
  },

  delprem: async (ctx) => {
    if (!ctx.isOwner) return ctx.reply("⚠️ Owner only. 👑");
    const [number] = ctx.args;
    if (!number) return ctx.reply("⚠️ Format: .delprem <number> 💕");
    const cleanNumber = number.replace(/[^0-9]/g, "");
    const removed = removePremium(cleanNumber);
    return ctx.reply(removed ? `✅ Removed ${cleanNumber} from Premium. 🌸` : `ℹ️ ${cleanNumber} was not Premium. 💕`);
  },

  listprem: async (ctx) => {
    if (!ctx.isOwner) return ctx.reply("⚠️ Owner only. 👑");
    const all = listPremium();
    if (!all.length) return ctx.reply("ℹ️ No active premium users. 💕");
    const lines = all.map((p) => `• ${p.id} — expires ${new Date(p.expired).toLocaleString()}`);
    return ctx.reply(`🌸 *PRETTY GIRL MD - Premium Users* 💕\n${lines.join("\n")}`);
  },

  broadcast: async (ctx) => {
    if (!ctx.isOwner) return ctx.reply("⚠️ Owner only. 👑");
    if (!ctx.text) return ctx.reply("⚠️ Format: .broadcast <message> 💕");
    try {
      const chats = await ctx.sock.groupFetchAllParticipating();
      const jids = Object.keys(chats);
      for (const jid of jids) {
        await ctx.sock.sendMessage(jid, { text: `📢 *PRETTY GIRL MD - Broadcast* 🌸\n\n${ctx.text}\n\n💕 Créé par DEV SHADOW TECH` });
      }
      return ctx.reply(`✅ Broadcast sent to ${jids.length} group(s). ✨`);
    } catch (err) {
      return ctx.reply(`⚠️ Broadcast failed: ${err.message} 💕`);
    }
  },
};

module.exports = { commands };