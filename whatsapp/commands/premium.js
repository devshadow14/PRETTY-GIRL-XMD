/**
 * 🌸 PRETTY GIRL MD - Premium Membership System
 * 💕 Créé par DEV SHADOW TECH
 * Premium membership system.
 * Functionally identical to the original project's premium logic
 * (per-number expiry timestamps stored in database/premium.json),
 * just cleaned up and exposed as reusable functions.
 */
"use strict";

const { premium } = require("../../database/db");

function isPremium(number) {
  const entry = premium.find((p) => p.id === number);
  if (!entry) return false;

  if (Date.now() >= entry.expired) {
    premium.removeWhere((p) => p.id === number);
    return false;
  }
  return true;
}

function addPremium(number, durationMs) {
  premium.removeWhere((p) => p.id === number); // avoid duplicate entries
  return premium.insert({ id: number, expired: Date.now() + durationMs });
}

function removePremium(number) {
  return premium.removeWhere((p) => p.id === number);
}

function listPremium() {
  // Filter out anything already expired before returning.
  return premium.filter((p) => p.expired > Date.now());
}

module.exports = { isPremium, addPremium, removePremium, listPremium };