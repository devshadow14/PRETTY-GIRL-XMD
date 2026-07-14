/**
 * 🌸 PRETTY GIRL MD - Telegram Format Helpers
 * 💕 Créé par DEV SHADOW TECH
 * Small text-formatting helpers shared across Telegram handlers.
 */
"use strict";

function formatUptime(ms) {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function statusEmoji(status) {
  switch (status) {
    case "connected":
      return "🟢";
    case "connecting":
      return "🟡";
    case "logged-out":
      return "⚫";
    default:
      return "🔴";
  }
}

module.exports = { formatUptime, formatBytes, statusEmoji };