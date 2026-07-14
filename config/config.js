/**
 * Central configuration for the whole project.
 * Everything sensitive (tokens, owner IDs) is loaded from environment
 * variables so the repo itself never contains secrets.
 */
"use strict";

require("dotenv").config();
const path = require("path");

function splitList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const config = {
  // ---- Telegram ----
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    ownerIds: splitList(process.env.TELEGRAM_OWNER_IDS),
  },

  // ---- WhatsApp ----
  whatsapp: {
    ownerNumbers: splitList(process.env.WA_OWNER_NUMBERS),
    botName: process.env.BOT_NAME || "Trazix",
    prefix: [".", "!", "#"],
  },

  // ---- General ----
  maxSessions: Number(process.env.MAX_SESSIONS || 5),

  // ---- Paths ----
  paths: {
    root: path.resolve(__dirname, ".."),
    sessions: path.resolve(__dirname, "../sessions"),
    database: path.resolve(__dirname, "../database"),
    media: path.resolve(__dirname, "../media"),
  },
};

module.exports = config;
