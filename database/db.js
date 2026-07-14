/**
 * Minimal JSON-file datastore.
 *
 * No external DB engine is required to run this project — everything
 * is persisted as JSON on disk. Each "table" is one JSON file under
 * /database, loaded into memory and written back on every mutation.
 *
 * This is intentionally simple (good enough for a few sessions / users)
 * rather than a generic ORM — swap it for SQLite/Mongo later if needed,
 * the rest of the codebase only talks to the methods below.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const config = require("../config/config");

const TABLE_DEFAULTS = {
  users: [],
  sessions: [],
  premium: [],
};

function ensureFile(filePath, defaultValue) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
}

class JSONTable {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(config.paths.database, `${name}.json`);
    ensureFile(this.filePath, TABLE_DEFAULTS[name] ?? []);
    this._cache = this._read();
  }

  _read() {
    try {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(raw || "[]");
    } catch (err) {
      console.error(`[DB] Failed to read ${this.name}.json:`, err.message);
      return [];
    }
  }

  _write() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this._cache, null, 2));
    } catch (err) {
      console.error(`[DB] Failed to write ${this.name}.json:`, err.message);
    }
  }

  all() {
    return this._cache;
  }

  find(predicate) {
    return this._cache.find(predicate);
  }

  filter(predicate) {
    return this._cache.filter(predicate);
  }

  insert(record) {
    this._cache.push(record);
    this._write();
    return record;
  }

  /** Updates the first record matching predicate with patch, or inserts if none found. */
  upsert(predicate, patch) {
    const existing = this._cache.find(predicate);
    if (existing) {
      Object.assign(existing, patch);
    } else {
      this._cache.push(patch);
    }
    this._write();
    return existing || patch;
  }

  removeWhere(predicate) {
    const before = this._cache.length;
    this._cache = this._cache.filter((item) => !predicate(item));
    this._write();
    return before !== this._cache.length;
  }
}

const tables = {
  users: new JSONTable("users"),
  sessions: new JSONTable("sessions"),
  premium: new JSONTable("premium"),
};

module.exports = tables;
