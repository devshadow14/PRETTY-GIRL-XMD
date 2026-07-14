/**
 * 🌸 PRETTY GIRL MD - WhatsApp Session Manager
 * 💕 Créé par DEV SHADOW TECH
 * ----------------------------------------------------------------
 * Owns the lifecycle of every WhatsApp connection (one Baileys socket
 * per paired number). Responsible for:
 *   - requesting pairing codes
 *   - persisting auth state per session (Baileys multi-file auth)
 *   - restoring all known sessions on boot
 *   - exposing logout / restart / delete operations
 *   - emitting lifecycle events the Telegram side can subscribe to
 *
 * This module has NO knowledge of Telegram. It only emits events via
 * a plain Node EventEmitter so the Telegram layer can react to them
 * (e.g. "send me the pairing code", "tell owner it connected").
 */
"use strict";

const path = require("path");
const fs = require("fs");
const { EventEmitter } = require("events");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const config = require("../config/config");
const { sessions: sessionsTable } = require("../database/db");
const { handleIncomingMessage } = require("./handler");

const logger = pino({ level: "silent" });

class WhatsAppManager extends EventEmitter {
  constructor() {
    super();
    /** @type {Map<string, { sock: any, status: string, generation: number }>} sessionId -> runtime state */
    this.connections = new Map();
    /** @type {Map<string, number>} sessionId -> current generation counter, used to invalidate stale reconnect timers */
    this.generations = new Map();
    
    // 🌸 PRETTY GIRL MD - Log startup
    console.log(`🌸 PRETTY GIRL MD - WhatsApp Manager initialized`);
    console.log(`💕 Créé par DEV SHADOW TECH`);
  }

  _nextGeneration(sessionId) {
    const next = (this.generations.get(sessionId) || 0) + 1;
    this.generations.set(sessionId, next);
    return next;
  }

  sessionDir(sessionId) {
    return path.join(config.paths.sessions, sessionId);
  }

  /** Returns metadata for all known sessions (DB rows), merged with live status. */
  listSessions() {
    return sessionsTable.all().map((row) => ({
      ...row,
      status: this.connections.get(row.id)?.status || row.status || "disconnected",
    }));
  }

  getConnection(sessionId) {
    return this.connections.get(sessionId);
  }

  /**
   * Starts (or restarts) a session. If `phoneNumber` is provided and the
   * session has no creds yet, a pairing code will be requested and emitted
   * via "pairing-code". Otherwise it restores from saved creds silently.
   */
  async startSession(sessionId, { phoneNumber, telegramOwnerId } = {}) {
    const dir = this.sessionDir(sessionId);
    fs.mkdirSync(dir, { recursive: true });

    const generation = this._nextGeneration(sessionId);

    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger,
      browser: [config.whatsapp.botName || "PRETTY GIRL MD", "Chrome", "120.0.0"],
      mobile: false,
    });

    this.connections.set(sessionId, { sock, status: "connecting", generation });

    sessionsTable.upsert(
      (s) => s.id === sessionId,
      {
        id: sessionId,
        phoneNumber: phoneNumber || this._findExistingNumber(sessionId),
        telegramOwnerId: telegramOwnerId || this._findExistingOwner(sessionId),
        status: "connecting",
        createdAt: this._findExistingCreatedAt(sessionId) || Date.now(),
        updatedAt: Date.now(),
      }
    );

    // Request a pairing code if this session isn't registered yet.
    if (phoneNumber && !sock.authState.creds.registered) {
      try {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
        const code = await sock.requestPairingCode(cleanNumber);
        const formatted = code?.match(/.{1,4}/g)?.join("-") || code;
        this.emit("pairing-code", { sessionId, telegramOwnerId, code: formatted, phoneNumber: cleanNumber });
      } catch (err) {
        this.emit("pairing-error", { sessionId, telegramOwnerId, error: err.message });
      }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      this._handleConnectionUpdate(sessionId, sock, update, telegramOwnerId, generation);
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages?.[0];
      if (!msg) return;
      try {
        await handleIncomingMessage(sock, msg);
      } catch (err) {
        console.error(`[🌸 PRETTY GIRL MD:${sessionId}] message handler error:`, err);
      }
    });

    return sock;
  }

  _findExistingNumber(sessionId) {
    return sessionsTable.find((s) => s.id === sessionId)?.phoneNumber || null;
  }

  _findExistingOwner(sessionId) {
    return sessionsTable.find((s) => s.id === sessionId)?.telegramOwnerId || null;
  }

  _findExistingCreatedAt(sessionId) {
    return sessionsTable.find((s) => s.id === sessionId)?.createdAt || null;
  }

  _handleConnectionUpdate(sessionId, sock, update, telegramOwnerId, generation) {
    const { connection, lastDisconnect } = update;
    const conn = this.connections.get(sessionId);

    // A newer generation has superseded this socket (manual restart/logout
    // already happened) — ignore further events from this stale instance.
    if (conn && conn.generation !== undefined && conn.generation !== generation) {
      return;
    }

    if (connection === "open") {
      if (conn) conn.status = "connected";
      sessionsTable.upsert((s) => s.id === sessionId, {
        id: sessionId,
        status: "connected",
        phoneNumber: sock.user?.id?.split(":")[0] || this._findExistingNumber(sessionId),
        telegramOwnerId: telegramOwnerId || this._findExistingOwner(sessionId),
        createdAt: this._findExistingCreatedAt(sessionId) || Date.now(),
        updatedAt: Date.now(),
      });
      this.emit("connected", { sessionId, telegramOwnerId });
      console.log(`🌸 PRETTY GIRL MD - Session ${sessionId} connected successfully ✨`);
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error instanceof Boom
          ? lastDisconnect.error.output?.statusCode
          : 0;

      const loggedOut = statusCode === DisconnectReason.loggedOut;

      if (conn) conn.status = loggedOut ? "logged-out" : "disconnected";
      sessionsTable.upsert((s) => s.id === sessionId, {
        id: sessionId,
        status: loggedOut ? "logged-out" : "disconnected",
        updatedAt: Date.now(),
      });

      if (loggedOut) {
        this.connections.delete(sessionId);
        this.emit("logged-out", { sessionId, telegramOwnerId });
        console.log(`🌸 PRETTY GIRL MD - Session ${sessionId} logged out`);
        return;
      }

      this.emit("disconnected", { sessionId, telegramOwnerId });
      console.log(`🌸 PRETTY GIRL MD - Session ${sessionId} disconnected, reconnecting...`);

      // Auto-reconnect using saved creds (not a fresh pairing request).
      // Guarded by generation so a manual restart/logout that happens
      // before this timer fires won't spawn a duplicate socket.
      setTimeout(() => {
        if (this.generations.get(sessionId) !== generation) return;
        this.startSession(sessionId, { telegramOwnerId }).catch((err) =>
          console.error(`[🌸 PRETTY GIRL MD:${sessionId}] reconnect failed:`, err.message)
        );
      }, 3000);
    }
  }

  /** Fully logs out a session and deletes its credentials from disk. */
  async logoutSession(sessionId) {
    const telegramOwnerId = this._findExistingOwner(sessionId);
    this._nextGeneration(sessionId); // invalidate any pending auto-reconnect for the old socket
    const conn = this.connections.get(sessionId);
    if (conn?.sock) {
      try {
        await conn.sock.logout();
      } catch {
        // ignore — socket may already be dead
      }
    }
    this.connections.delete(sessionId);

    const dir = this.sessionDir(sessionId);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    sessionsTable.removeWhere((s) => s.id === sessionId);
    this.generations.delete(sessionId);
    this.emit("logged-out", { sessionId, telegramOwnerId });
    console.log(`🌸 PRETTY GIRL MD - Session ${sessionId} logged out and cleaned up`);
  }

  /** Restarts a session's socket without deleting its saved credentials. */
  async restartSession(sessionId) {
    this._nextGeneration(sessionId); // invalidate any pending auto-reconnect for the old socket
    const conn = this.connections.get(sessionId);
    const meta = sessionsTable.find((s) => s.id === sessionId);
    if (conn?.sock) {
      try {
        conn.sock.end(undefined);
      } catch {
        // ignore
      }
      this.connections.delete(sessionId);
    }
    console.log(`🌸 PRETTY GIRL MD - Restarting session ${sessionId}...`);
    await this.startSession(sessionId, { telegramOwnerId: meta?.telegramOwnerId });
  }

  /** Restores every session found in the database (called once on boot). */
  async restoreAll() {
    const rows = sessionsTable.all();
    console.log(`🌸 PRETTY GIRL MD - Restoring ${rows.length} WhatsApp session(s)...`);
    for (const row of rows) {
      if (row.status === "logged-out") continue;
      try {
        await this.startSession(row.id, { telegramOwnerId: row.telegramOwnerId });
      } catch (err) {
        console.error(`[🌸 PRETTY GIRL MD:${row.id}] failed to restore session:`, err.message);
      }
    }
    console.log(`🌸 PRETTY GIRL MD - All sessions restored! 💕`);
  }
}

module.exports = new WhatsAppManager();