/**
 * 🌸 PRETTY GIRL MD - Group Administration Commands
 * 💕 Créé par DEV SHADOW TECH
 * Group administration commands. Require the bot AND the invoking
 * user to be group admins (standard WhatsApp group-bot behaviour).
 */
"use strict";

async function isSenderAdmin(ctx) {
  if (!ctx.groupMetadata) return false;
  const participant = ctx.groupMetadata.participants.find(
    (p) => p.id === ctx.sender
  );
  return participant?.admin === "admin" || participant?.admin === "superadmin";
}

async function isBotAdmin(ctx) {
  if (!ctx.groupMetadata) return false;
  const botId = ctx.sock.user.id.split(":")[0] + "@s.whatsapp.net";
  const participant = ctx.groupMetadata.participants.find((p) => p.id === botId);
  return participant?.admin === "admin" || participant?.admin === "superadmin";
}

function getMentionedOrQuoted(ctx) {
  const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const quotedParticipant = ctx.msg.message?.extendedTextMessage?.contextInfo?.participant;
  if (mentioned?.length) return mentioned[0];
  if (quotedParticipant) return quotedParticipant;
  return null;
}

const commands = {
  groupinfo: async (ctx) => {
    if (!ctx.isGroup) return ctx.reply("⚠️ This command only works in groups.");
    const g = ctx.groupMetadata;
    return ctx.reply(
      `🌸 *PRETTY GIRL MD - Group Info* 💕\n\n` +
        `◇ Name: ${g.subject}\n` +
        `◇ Members: ${g.participants.length}\n` +
        `◇ Created: ${new Date(g.creation * 1000).toLocaleDateString()}\n` +
        `◇ Description: ${g.desc || "—"}\n` +
        `◇ Bot: PRETTY GIRL MD ✨\n` +
        `◇ Créé par DEV SHADOW TECH`
    );
  },

  kick: async (ctx) => {
    if (!ctx.isGroup) return ctx.reply("⚠️ This command only works in groups.");
    if (!(await isSenderAdmin(ctx)) && !ctx.isOwner) return ctx.reply("⚠️ Admins only. 💕");
    if (!(await isBotAdmin(ctx))) return ctx.reply("⚠️ I need to be an admin to do that. ✨");

    const target = getMentionedOrQuoted(ctx);
    if (!target) return ctx.reply("⚠️ Mention or reply to the user you want to remove. 💕");

    await ctx.sock.groupParticipantsUpdate(ctx.msg.key.remoteJid, [target], "remove");
    return ctx.reply(`✅ Removed @${target.split("@")[0]} 🌸`, {
      contextInfo: { mentionedJid: [target] },
    });
  },

  promote: async (ctx) => {
    if (!ctx.isGroup) return ctx.reply("⚠️ This command only works in groups.");
    if (!(await isSenderAdmin(ctx)) && !ctx.isOwner) return ctx.reply("⚠️ Admins only. 💕");
    if (!(await isBotAdmin(ctx))) return ctx.reply("⚠️ I need to be an admin to do that. ✨");

    const target = getMentionedOrQuoted(ctx);
    if (!target) return ctx.reply("⚠️ Mention or reply to the user you want to promote. 💕");

    await ctx.sock.groupParticipantsUpdate(ctx.msg.key.remoteJid, [target], "promote");
    return ctx.reply(`✅ Promoted @${target.split("@")[0]} to admin 👑`, {
      contextInfo: { mentionedJid: [target] },
    });
  },

  demote: async (ctx) => {
    if (!ctx.isGroup) return ctx.reply("⚠️ This command only works in groups.");
    if (!(await isSenderAdmin(ctx)) && !ctx.isOwner) return ctx.reply("⚠️ Admins only. 💕");
    if (!(await isBotAdmin(ctx))) return ctx.reply("⚠️ I need to be an admin to do that. ✨");

    const target = getMentionedOrQuoted(ctx);
    if (!target) return ctx.reply("⚠️ Mention or reply to the user you want to demote. 💕");

    await ctx.sock.groupParticipantsUpdate(ctx.msg.key.remoteJid, [target], "demote");
    return ctx.reply(`✅ Demoted @${target.split("@")[0]} 🌸`, {
      contextInfo: { mentionedJid: [target] },
    });
  },
};

module.exports = { commands };