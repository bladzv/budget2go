/**
 * utils.js — Security-first utilities
 * Exposed on window.App.utils (no ES modules, works with file:// protocol)
 */
(function () {
  'use strict';

  window.App = window.App || {};

  /* ──────────────────────────────────────────────────────
     XSS PROTECTION — escape all user content before innerHTML
  ────────────────────────────────────────────────────── */
  /**
   * HTML-escape a value before inserting into innerHTML.
   * ALWAYS use this for any user-supplied string in an HTML template.
   */
  function esc(s) {
    var str = s == null ? "" : String(s);
    return str
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#039;');
  }

  /* ──────────────────────────────────────────────────────
     INPUT SANITIZERS
  ────────────────────────────────────────────────────── */
  /**
   * Sanitize a string from untrusted input.
   * Strips control characters, limits length.
   */
  function safeStr(v, maxLen) {
    var str = v == null ? "" : String(v);
    return str
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim()
      .slice(0, maxLen || 200);
  }

  /**
   * Parse a number safely — returns 0 for NaN/Infinite.
   * Optionally allows negative values.
   */
  function safeNum(v, allowNeg) {
    const n = parseFloat(String(v == null ? 0 : v).replace(/[^0-9.\-]/g, ''));
    if (!isFinite(n)) return 0;
    if (!allowNeg && n < 0) return 0;
    return Math.round(n * 100) / 100; // max 2 decimal places
  }

  /**
   * Sanitize a filename: only allow alphanumeric, underscores, hyphens, dots.
   * Prevents path traversal.
   */
  function sanitizeFilename(s) {
    var str = s ? String(s) : "";
    return str
      .trim()
      .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^[_\-\.]+|[_\-\.]+$/g, "")
      .slice(0, 100);
  }

  /* ──────────────────────────────────────────────────────
     FORMATTING
  ────────────────────────────────────────────────────── */
  const _phpFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  /** Format a number as PHP currency string. */
  function fmt(n) {
    return _phpFormatter.format(n || 0);
  }

  /** Format an ISO date string as short human-readable date. */
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
      });
    } catch (err) {
      return String(iso).slice(0, 10);
    }
  }

  /* ──────────────────────────────────────────────────────
     ID GENERATION
  ────────────────────────────────────────────────────── */
  /**
   * Generate a collision-resistant unique ID.
   * Uses crypto.randomUUID if available, falls back to timestamp+random.
   */
  function uid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  /* ──────────────────────────────────────────────────────
     DEFAULT FILENAME
  ────────────────────────────────────────────────────── */
  function defaultFilename() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return (
      'budget_' +
      now.getFullYear() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      '_' +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds())
    );
  }

  /* ──────────────────────────────────────────────────────
     EXPORT
  ────────────────────────────────────────────────────── */
  App.utils = { esc, safeStr, safeNum, sanitizeFilename, fmt, fmtDate, uid, defaultFilename };
})();
