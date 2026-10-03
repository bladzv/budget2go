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
    const raw = String(v == null ? 0 : v).trim();
    const n = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(raw)
      ? Number(raw) : parseFloat(raw.replace(/[^0-9.\-]/g, ''));
    if (!isFinite(n)) return 0;
    if (!allowNeg && n < 0) return 0;
    return Math.abs(n) > Number.MAX_VALUE / 100 ? n : Math.round(n * 100) / 100; // max 2 decimal places
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
  let _useGrouping = true;
  let _currencyCode   = 'PHP';
  let _currencyLocale = 'en-PH';
  let _currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

  /** Change the active display currency. Rebuilds the Intl formatter. */
  function setCurrency(code, locale) {
    try {
      const c = String(code  || 'PHP').toUpperCase().slice(0, 10);
      const l = String(locale || 'en-PH').slice(0, 20);
      _currencyFormatter = new Intl.NumberFormat(l, {
        style: 'currency', currency: c, useGrouping: _useGrouping,
      });
      _currencyCode   = c;
      _currencyLocale = l;
    } catch (_) {
      // Invalid currency/locale — silently keep the existing formatter.
    }
  }

  /** Return the active ISO currency code (e.g. "PHP", "USD"). */
  function getCurrencyCode() { return _currencyCode; }

  /** Match the currency symbol used by the active display formatter. */
  function getCurrencySymbol() {
    return _currencyFormatter.formatToParts(0).find(part => part.type === 'currency')?.value || _currencyCode;
  }

  /** Format a number using the active display currency. */
  function fmt(n, fractionDigits) {
    // An apply action must show the exact amount, even for currencies such as JPY.
    const formatter = fractionDigits == null ? _currencyFormatter : new Intl.NumberFormat(_currencyLocale, {
      style:'currency', currency:_currencyCode, useGrouping:_useGrouping,
      minimumFractionDigits:fractionDigits, maximumFractionDigits:fractionDigits,
    });
    const parts = formatter.formatToParts(n || 0);
    return parts.map((part, index) => part.value +
      (part.type === 'currency' && parts[index + 1]?.type === 'integer' ? '\u00a0' : '')).join('');
  }

  function setGrouping(enabled) {
    _useGrouping = !!enabled;
    setCurrency(_currencyCode, _currencyLocale);
  }
  function formatAmount(value, grouping = _useGrouping) {
    return new Intl.NumberFormat(_currencyLocale, { useGrouping: grouping, maximumFractionDigits: 2 }).format(value || 0);
  }
  function parseAmount(value) {
    const parts = new Intl.NumberFormat(_currencyLocale).formatToParts(12345.6);
    const group = parts.find(part => part.type === 'group')?.value;
    const decimal = parts.find(part => part.type === 'decimal')?.value || '.';
    let raw = String(value).trim();
    if (!raw) return null;
    if (group && raw.includes(group)) {
      const mantissa = raw.split(/[eE]/)[0];
      const [integer, fraction = ''] = mantissa.split(decimal);
      const chunks = integer.split(group);
      if (fraction.includes(group) || chunks.length < 2 || !/^\+?\d{1,3}$/.test(chunks[0]) ||
          chunks.slice(1).some(chunk => !/^\d{3}$/.test(chunk))) return null;
      raw = raw.split(group).join('');
    }
    raw = raw.replace(/[\s\u00a0\u202f]/g, '').replace(decimal, '.');
    if (!/^\+?(?:\d+(?:\.\d{0,2})?|\.\d{1,2})(?:e[+-]?\d+)?$/i.test(raw)) return null;
    const number = Number(raw);
    return Number.isFinite(number) && number >= 0 ? number : null;
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
  function defaultFilename(includeTimestamp = true) {
    if (!includeTimestamp) return 'budget2go';
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return (
      'budget2go_' +
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
  App.utils = { esc, safeStr, safeNum, sanitizeFilename, fmt, setCurrency, getCurrencyCode, getCurrencySymbol, setGrouping, formatAmount, parseAmount, fmtDate, uid, defaultFilename };
})();
