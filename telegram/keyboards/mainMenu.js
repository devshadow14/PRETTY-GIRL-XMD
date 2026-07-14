/**
 * 🌸 PRETTY GIRL MD - Keyboard Layouts
 * 💕 Créé par DEV SHADOW TECH
 * Inline keyboard layouts for the Telegram control panel.
 */
"use strict";

const { Markup } = require("telegraf");

function mainMenu(isOwner) {
  const rows = [
    [Markup.button.callback("🔗 Pair WhatsApp", "menu:pair")],
    [Markup.button.callback("📱 Sessions", "menu:sessions"), Markup.button.callback("📊 Status", "menu:status")],
    [Markup.button.callback("🔄 Restart", "menu:restart"), Markup.button.callback("🗑 Logout", "menu:logout")],
    [Markup.button.callback("⚙ Settings", "menu:settings")],
    [Markup.button.callback("📋 Logs", "menu:logs")],
  ];
  if (isOwner) {
    rows.push([Markup.button.callback("👑 Owner Panel", "menu:owner")]);
  }
  rows.push([Markup.button.callback("💕 About PRETTY GIRL MD", "menu:about")]);
  return Markup.inlineKeyboard(rows);
}

function ownerPanel() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📢 Broadcast", "owner:broadcast")],
    [Markup.button.callback("👥 Users", "owner:users"), Markup.button.callback("📈 Statistics", "owner:stats")],
    [Markup.button.callback("📄 View Logs", "owner:logs")],
    [Markup.button.callback("🔄 Restart Bot", "owner:restart"), Markup.button.callback("⛔ Shutdown", "owner:shutdown")],
    [Markup.button.callback("⬅️ Back", "menu:main")],
  ]);
}

function sessionsList(sessions) {
  const rows = sessions.map((s) => [
    Markup.button.callback(
      `${s.status === "connected" ? "🟢" : "🔴"} ${s.phoneNumber || s.id}`,
      `session:view:${s.id}`
    ),
  ]);
  rows.push([Markup.button.callback("➕ Pair New Number", "menu:pair")]);
  rows.push([Markup.button.callback("⬅️ Back", "menu:main")]);
  return Markup.inlineKeyboard(rows);
}

function sessionActions(sessionId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🔄 Restart", `session:restart:${sessionId}`),
      Markup.button.callback("🗑 Logout", `session:logout:${sessionId}`),
    ],
    [Markup.button.callback("⬅️ Back", "menu:sessions")],
  ]);
}

function confirm(actionYes, actionNo = "menu:main") {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✅ Confirm", actionYes), Markup.button.callback("❌ Cancel", actionNo)],
  ]);
}

function aboutMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("⬅️ Back", "menu:main")],
  ]);
}

module.exports = { mainMenu, ownerPanel, sessionsList, sessionActions, confirm, aboutMenu };