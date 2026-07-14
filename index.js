/**
 * 🌸 PRETTY GIRL MD - Entry Point
 * 💕 Boots the file logger, the Telegram control panel, and restores
 * every previously-paired WhatsApp session.
 * 👨‍💻 Créé par DEV SHADOW TECH
 */
"use strict";

const chalk = require("chalk");
const { initFileLogger } = require("./logger");
const { createBot } = require("./telegram/bot");
const waManager = require("./whatsapp/manager");
const config = require("./config/config");

// 🌸 PRETTY GIRL MD - Bannière de démarrage
console.log(chalk.magenta("╔════════════════════════════════════════════════════╗"));
console.log(chalk.magenta("║                                                    ║"));
console.log(chalk.magenta("║  🌸  P R E T T Y   G I R L   M D  🌸            ║"));
console.log(chalk.magenta("║                                                    ║"));
console.log(chalk.magenta("║  💕 WhatsApp Bot with Telegram Control Panel      ║"));
console.log(chalk.magenta("║  👨‍💻 Créé par DEV SHADOW TECH                    ║"));
console.log(chalk.magenta("║  📌 Version 5.0.0                                 ║"));
console.log(chalk.magenta("║                                                    ║"));
console.log(chalk.magenta("╚════════════════════════════════════════════════════╝"));
console.log("");

initFileLogger();

async function main() {
  console.log(chalk.bold.magenta("🌸 PRETTY GIRL MD - Starting Telegram control panel..."));

  const bot = createBot();
  await bot.launch();
  console.log(chalk.bold.green("✓ Telegram bot is online ✨"));

  console.log(chalk.bold.magenta("🌸 PRETTY GIRL MD - Restoring saved WhatsApp sessions..."));
  await waManager.restoreAll();
  console.log(chalk.bold.green(`✓ Ready. (${config.whatsapp.botName} Control Panel 💕)`));
  console.log(chalk.bold.cyan(`👨‍💻 Créé par DEV SHADOW TECH`));

  process.once("SIGINT", () => {
    console.log(chalk.yellow("🌸 PRETTY GIRL MD - Shutting down (SIGINT)..."));
    bot.stop("SIGINT");
    process.exit(0);
  });
  process.once("SIGTERM", () => {
    console.log(chalk.yellow("🌸 PRETTY GIRL MD - Shutting down (SIGTERM)..."));
    bot.stop("SIGTERM");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(chalk.red(`✕ PRETTY GIRL MD - Fatal error: ${err.message}`));
  process.exit(1);
});