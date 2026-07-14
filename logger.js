/**
 * 🌸 PRETTY GIRL MD - File Logger
 * 💕 Tiny append-only file logger backing the Telegram "View Logs" button.
 * Wraps console.log/error so existing log call-sites don't need to change,
 * while also persisting a rolling log file to disk.
 * 👨‍💻 Créé par DEV SHADOW TECH
 */
"use strict";

const fs = require("fs");
const path = require("path");
const config = require("./config/config");

const LOG_PATH = path.join(config.paths.root, "pretty-girl-md.log");
const MAX_LOG_BYTES = 2 * 1024 * 1024; // 2MB rolling cap

function appendLog(line) {
  try {
    if (fs.existsSync(LOG_PATH) && fs.statSync(LOG_PATH).size > MAX_LOG_BYTES) {
      const content = fs.readFileSync(LOG_PATH, "utf-8");
      fs.writeFileSync(LOG_PATH, content.slice(-Math.floor(MAX_LOG_BYTES / 2)));
    }
    fs.appendFileSync(LOG_PATH, line + "\n");
  } catch {
    // Logging must never crash the app.
  }
}

function initFileLogger() {
  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args) => {
    appendLog(`[🌸 PRETTY GIRL MD] [${new Date().toISOString()}] ${args.join(" ")}`);
    originalLog(...args);
  };

  console.error = (...args) => {
    appendLog(`[🌸 PRETTY GIRL MD] [${new Date().toISOString()}] ERROR: ${args.join(" ")}`);
    originalError(...args);
  };
}

module.exports = { initFileLogger };