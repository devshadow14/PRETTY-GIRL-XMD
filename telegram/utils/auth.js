/**
 * 🌸 PRETTY GIRL MD - Telegram Authorization Helpers
 * 💕 Créé par DEV SHADOW TECH
 * Telegram authorization helpers.
 * Decides who is allowed to use the control panel at all, and who
 * gets owner-only commands (broadcast, shutdown, etc.)
 */
"use strict";

const config = require("../../config/config");
const { users } = require("../../database/db");

function isOwner(telegramId) {
  return config.telegram.ownerIds.includes(String(telegramId));
}

/** Primary owner = first ID listed in TELEGRAM_OWNER_IDS. */
function isPrimaryOwner(telegramId) {
  return config.telegram.ownerIds[0] === String(telegramId);
}

/** Anyone in TELEGRAM_OWNER_IDS, or anyone who has been explicitly approved. */
function isAuthorized(telegramId) {
  if (isOwner(telegramId)) return true;
  const user = users.find((u) => u.telegramId === String(telegramId));
  return Boolean(user?.approved);
}

function registerUser(telegramId, meta = {}) {
  return users.upsert(
    (u) => u.telegramId === String(telegramId),
    {
      telegramId: String(telegramId),
      username: meta.username || null,
      approved: isOwner(telegramId), // owners are auto-approved
      joinedAt: users.find((u) => u.telegramId === String(telegramId))?.joinedAt || Date.now(),
    }
  );
}

module.exports = { isOwner, isPrimaryOwner, isAuthorized, registerUser };