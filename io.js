/**
 * io.js — Import (JSON, CSV) and export (JSON, CSV).
 * Depends on: utils.js (App.utils), state.js (App.state), ui.js (App.ui)
 */
(function () {
  'use strict';

  const { safeStr, safeNum, uid, sanitizeFilename, defaultFilename } = App.utils;
  const S = App.state;
  const ENC_FORMAT = 'budgetos-encrypted-v1';
  const ENC_ITERATIONS = 600000;
  const ENC_SALT_BYTES = 16;
  const ENC_IV_BYTES = 12;

  /* ──────────────────────────────────────────────────────
     FILE DOWNLOAD HELPER
  ────────────────────────────────────────────────────── */
  function triggerDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.style.display = 'none';
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  /* ──────────────────────────────────────────────────────
     EXPORT: GET FILENAME
  ────────────────────────────────────────────────────── */
  function resolveFilename(raw, ext) {
    const safe = sanitizeFilename(raw || '');
    const base = safe || defaultFilename();
    return base + ext;
  }

  /* ──────────────────────────────────────────────────────
     EXPORT: JSON
  ────────────────────────────────────────────────────── */
  function bytesToB64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function b64ToBytes(b64) {
    const bin = atob(String(b64 || ''));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function deriveEncKey(password, salt, usage) {
    const cryptoObj = window.crypto || self.crypto;
    if (!cryptoObj || !cryptoObj.subtle) {
      throw new Error('Web Crypto API is not available in this browser.');
    }
    const enc = new TextEncoder();
    const baseKey = await cryptoObj.subtle.importKey(
      'raw',
      enc.encode(String(password || '')),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return cryptoObj.subtle.deriveKey(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: salt,
        iterations: ENC_ITERATIONS,
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      [usage]
    );
  }

  async function encryptPayload(plainText, password, dataType) {
    const pwd = String(password || '');
    if (pwd.length < 8) {
      throw new Error('Password must be at least 8 characters for encryption.');
    }
    const cryptoObj = window.crypto || self.crypto;
    const salt = cryptoObj.getRandomValues(new Uint8Array(ENC_SALT_BYTES));
    const iv = cryptoObj.getRandomValues(new Uint8Array(ENC_IV_BYTES));
    const key = await deriveEncKey(pwd, salt, 'encrypt');
    const enc = new TextEncoder();
    const cipherBuffer = await cryptoObj.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      enc.encode(String(plainText || ''))
    );
    return JSON.stringify({
      format: ENC_FORMAT,
      version: 1,
      alg: 'AES-GCM-256',
      kdf: {
        name: 'PBKDF2',
        hash: 'SHA-256',
        iterations: ENC_ITERATIONS,
        salt: bytesToB64(salt),
      },
      iv: bytesToB64(iv),
      dataType: dataType,
      ciphertext: bytesToB64(new Uint8Array(cipherBuffer)),
    }, null, 2);
  }

  async function decryptEnvelope(text, password) {
    let payload;
    try {
      payload = JSON.parse(text);
    } catch (err) {
      throw new Error('Encrypted file is not valid JSON.');
    }
    if (!payload || payload.format !== ENC_FORMAT || !payload.kdf || !payload.iv || !payload.ciphertext) {
      throw new Error('Unsupported encrypted file format.');
    }
    const pwd = String(password || '');
    if (!pwd) throw new Error('Password is required for encrypted import.');
    const salt = b64ToBytes(payload.kdf.salt);
    const iv = b64ToBytes(payload.iv);
    const cipher = b64ToBytes(payload.ciphertext);
    const key = await deriveEncKey(pwd, salt, 'decrypt');
    try {
      const plainBuffer = await (window.crypto || self.crypto).subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        cipher
      );
      const plainText = new TextDecoder().decode(plainBuffer);
      return {
        dataType: safeStr(payload.dataType, 10).toLowerCase(),
        plainText: plainText,
      };
    } catch (err) {
      throw new Error('Wrong password or corrupted encrypted file.');
    }
  }

  function normalizeExportOptions(options) {
    const opts = options || {};
    return {
      encrypt: !!opts.encrypt,
      password: String(opts.password || ''),
    };
  }

  function recordExportMeta(filename, encrypted) {
    try {
      localStorage.setItem('b2g-last-export', JSON.stringify({
        filename: String(filename || ''),
        encrypted: !!encrypted,
        at: new Date().toISOString(),
      }));
    } catch (_) {}
  }

  function exportJSON(rawFilename, options) {
    const opts = normalizeExportOptions(options);
    const data = JSON.stringify(S.getDocument(), null, 2);
    if (opts.encrypt) {
      return encryptPayload(data, opts.password, 'json').then((encrypted) => {
        const filename = resolveFilename(rawFilename, '.bgo');
        triggerDownload(encrypted, filename, 'application/json;charset=utf-8;');
        recordExportMeta(filename, true);
        App.ui.toast('Encrypted download started: ' + filename, 'success');
        return { filename, format: 'json', encrypted: true };
      });
    }
    const filename = resolveFilename(rawFilename, '.json');
    triggerDownload(data, filename, 'application/json;charset=utf-8;');
    recordExportMeta(filename, false);
    App.ui.toast('Download started: ' + filename, 'success');
    return Promise.resolve({ filename, format: 'json', encrypted: false });
  }

  /* ──────────────────────────────────────────────────────
     EXPORT: CSV
  ────────────────────────────────────────────────────── */
  function csvEscape(v) {
    var s = v == null ? "" : String(v);
    // Prevent CSV/Formula injection when opening exported files in spreadsheet apps.
    // Prefix dangerous leading characters with a single quote.
    if (/^[=\+\-@]/.test(s)) {
      s = "'" + s;
    }
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function csvRow(arr) {
    return arr.map(csvEscape).join(',');
  }

  function buildCSV() {
    const doc = S.getDocument();
    const lines = [];

    // A compact, quoted document row preserves all months and metadata. The
    // following tables include a month column for spreadsheet filtering.
    lines.push('## DOCUMENT_JSON');
    lines.push('json');
    lines.push(csvRow([JSON.stringify(S.getDocument())]));
    lines.push('');

    const sections = [
      ['SALARY', 'salary', ['id', 'source', 'amount', 'frequency']],
      ['SAVINGS', 'savings', ['id', 'location', 'amount']],
      ['BUDGET', 'budget', ['id', 'name', 'amount', 'paid', 'loanId', 'lastPaymentId', 'recurring']],
      ['LOANS', 'loans', ['id', 'name', 'total', 'frequency', 'paymentAmount', 'monthsPaid', 'paidPeriods', 'startingCredit', 'budgetEntryId']],
    ];
    for (const [title, kind, fields] of sections) {
      lines.push('## ' + title, csvRow(['month', ...fields]));
      for (const month of Object.keys(doc.months).sort()) {
        for (const entry of doc.months[month][kind]) lines.push(csvRow([month, ...fields.map(key => entry[key] ?? '')]));
      }
      lines.push('');
    }
    lines.push('## LOAN_PAYMENTS', csvRow(['month', 'loanId', 'id', 'date', 'amount']));
    for (const month of Object.keys(doc.months).sort()) {
      for (const loan of doc.months[month].loans) {
        for (const payment of loan.payments || []) lines.push(csvRow([month, loan.id, payment.id, payment.date, payment.amount]));
      }
    }

    return lines.join('\r\n');
  }

  function exportCSV(rawFilename, options) {
    const opts = normalizeExportOptions(options);
    const csv = buildCSV();
    if (opts.encrypt) {
      return encryptPayload(csv, opts.password, 'csv').then((encrypted) => {
        const filename = resolveFilename(rawFilename, '.bgo');
        triggerDownload(encrypted, filename, 'application/json;charset=utf-8;');
        recordExportMeta(filename, true);
        App.ui.toast('Encrypted download started: ' + filename, 'success');
        return { filename, format: 'csv', encrypted: true };
      });
    }
    const filename = resolveFilename(rawFilename, '.csv');
    triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
    recordExportMeta(filename, false);
    App.ui.toast('Download started: ' + filename, 'success');
    return Promise.resolve({ filename, format: 'csv', encrypted: false });
  }

  /* ──────────────────────────────────────────────────────
     IMPORT: PROCESS FILE
  ────────────────────────────────────────────────────── */
  async function processFile(file, onDone, options) {
    if (!file) return;
    const opts = options || {};
    const isEncrypted = !!opts.encrypted;
    const password = String(opts.password || '');

    // Extension validation (defence against spoofed MIME)
    const ext = (file.name || '').split('.').pop().toLowerCase();
    if (ext !== 'json' && ext !== 'csv' && ext !== 'bgo') {
      throw new Error('Invalid file type. Choose a .json, .csv, or .bgo file.');
    }

    // File size guard: max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 5 MB.');
    }
    const text = await file.text();
    const treatAsEncrypted = isEncrypted || ext === 'bgo';
    const decoded = treatAsEncrypted ? await decryptEnvelope(text, password) : {
      dataType: ext, plainText: text,
    };
    const doc = decoded.dataType === 'json' ? importJSON(decoded.plainText) :
      decoded.dataType === 'csv' ? importCSV(decoded.plainText) : null;
    if (!doc) throw new Error('Unsupported payload type.');
    if (typeof onDone === 'function') onDone(doc);
    return doc;
  }

  /* ──────────────────────────────────────────────────────
     IMPORT: JSON
  ────────────────────────────────────────────────────── */
  function sanitizeState(data) {
    if (!data || typeof data !== 'object') throw new Error('Invalid month data.');
    for (const key of ['salary', 'savings', 'budget', 'loans']) {
      if (!Array.isArray(data[key])) throw new Error('"' + key + '" must be an array.');
      if (data[key].length > 2000) throw new Error('Too many ' + key + ' entries.');
    }
    const obj = (value) => value && typeof value === 'object' ? value : {};
    const newState = {
      salary: data.salary.map((raw) => { const s = obj(raw); return {
        id: safeStr(s.id || uid(), 50), source: safeStr(s.source, 100),
        amount: safeNum(s.amount), frequency: S.VALID_FREQS.has(s.frequency) ? s.frequency : 'monthly',
      }; }),
      savings: data.savings.map((raw) => { const s = obj(raw); return {
        id: safeStr(s.id || uid(), 50), location: safeStr(s.location, 100), amount: safeNum(s.amount),
      }; }),
      budget: data.budget.map((raw) => { const b = obj(raw); return {
        id: safeStr(b.id || uid(), 50), name: safeStr(b.name, 100), amount: safeNum(b.amount),
        paid: !!b.paid, loanId: b.loanId ? safeStr(b.loanId, 50) : null,
        lastPaymentId: b.lastPaymentId ? safeStr(b.lastPaymentId, 50) : null,
        recurring: !!b.recurring || !!b.loanId,
      }; }),
      loans: data.loans.map((raw) => { const l = obj(raw); return {
        id: safeStr(l.id || uid(), 50), name: safeStr(l.name, 100), total: safeNum(l.total),
        frequency: S.VALID_FREQS.has(l.frequency) ? l.frequency : 'monthly',
        paymentAmount: safeNum(l.paymentAmount), monthsPaid: Math.max(0, Math.floor(safeNum(l.monthsPaid))),
        ...S.loanProgress(l),
        budgetEntryId: l.budgetEntryId ? safeStr(l.budgetEntryId, 50) : null,
        payments: Array.isArray(l.payments) ? l.payments.slice(0, 5000).map((rawPayment) => {
          const p = obj(rawPayment);
          return { id: safeStr(p.id || uid(), 50), date: safeStr(p.date, 30), amount: safeNum(p.amount) };
        }) : [],
      }; }),
    };
    if (data.loans.some((l) => Array.isArray(l && l.payments) && l.payments.length > 5000)) {
      throw new Error('Too many loan payments.');
    }
    enforceReferentialIntegrity(newState);
    return newState;
  }

  function importJSON(text) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error('Not valid JSON.');
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('JSON root must be an object.');
    }
    if ([2, 3].includes(data.version)) {
      if (!data.months || typeof data.months !== 'object' || Array.isArray(data.months) ||
          Object.keys(data.months).length > 120 || !data.months[data.activeMonth]) {
        throw new Error('Invalid monthly document.');
      }
      const months = {};
      for (const [key, value] of Object.entries(data.months)) {
        if (!S.validMonth(key)) throw new Error('Invalid month key.');
        months[key] = sanitizeState(value);
      }
      const allowed = new Set(['PHP|en-PH', 'USD|en-US', 'EUR|de-DE', 'GBP|en-GB', 'JPY|ja-JP', 'SGD|en-SG']);
      if (!S.validMonth(data.activeMonth) || (data.version === 3 && (!S.validMonth(data.viewedMonth) || !months[data.viewedMonth]))) throw new Error('Invalid selected month.');
      return { version: 3, activeMonth: Object.keys(months).sort().at(-1), viewedMonth: data.version === 3 ? data.viewedMonth : data.activeMonth,
        currency: allowed.has(data.currency) ? data.currency : 'PHP|en-PH', months };
    }
    if (data.version != null && data.version !== 1) throw new Error('Unsupported budget document version.');
    return { version: 3, activeMonth: S.currentMonth(), viewedMonth: S.currentMonth(), currency: S.getCurrency(),
      months: { [S.currentMonth()]: sanitizeState(data) } };
  }

  /* ──────────────────────────────────────────────────────
     IMPORT: CSV
  ────────────────────────────────────────────────────── */
  function importCSV(text) {
    const lines  = text.split(/\r?\n/);
    let section  = null;

    const sections = {
      DOCUMENT_JSON: [],
      SALARY:        [],
      SAVINGS:       [],
      BUDGET:        [],
      LOANS:         [],
      LOAN_PAYMENTS: [],
    };

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      if (line.startsWith('##')) {
        const key = line.replace(/^##\s*/, '').trim().toUpperCase().replace(/\s+/g, '_');
        section = key in sections ? key : null;
        continue;
      }
      if (section) {
        sections[section].push(parseCsvLine(line));
      }
    }

    function sectionObjects(key) {
      const rows = sections[key];
      if (rows.length < 2) return [];
      const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      return rows.slice(1).map((row) => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
        return obj;
      });
    }

    if (sections.DOCUMENT_JSON.length >= 2 && sections.DOCUMENT_JSON[1][0]) {
      return importJSON(sections.DOCUMENT_JSON[1][0]);
    }

    const salaryRows  = sectionObjects('SALARY');
    const savingsRows = sectionObjects('SAVINGS');
    const budgetRows  = sectionObjects('BUDGET');
    const loanRows    = sectionObjects('LOANS');
    const payRows     = sectionObjects('LOAN_PAYMENTS');

    // Group payments by loanId
    const paymentsByLoan = {};
    payRows.forEach((p) => {
      const lid = safeStr(p.loanid || '', 50);
      if (!lid) return;
      if (!paymentsByLoan[lid]) paymentsByLoan[lid] = [];
      paymentsByLoan[lid].push({
        id:     safeStr(p.id || uid(), 50),
        date:   safeStr(p.date, 30),
        amount: safeNum(p.amount),
      });
    });

    const newState = {
      salary: salaryRows.map((r) => ({
        id:        safeStr(r.id || uid(), 50),
        source:    safeStr(r.source, 100),
        amount:    safeNum(r.amount),
        frequency: S.VALID_FREQS.has(r.frequency) ? r.frequency : 'monthly',
      })),
      savings: savingsRows.map((r) => ({
        id:       safeStr(r.id || uid(), 50),
        location: safeStr(r.location, 100),
        amount:   safeNum(r.amount),
      })),
      budget: budgetRows.map((r) => ({
        id:            safeStr(r.id || uid(), 50),
        name:          safeStr(r.name, 100),
        amount:        safeNum(r.amount),
        paid:          r.paid === 'true' || r.paid === '1',
        loanId:        r.loanid        ? safeStr(r.loanid,        50) : null,
        lastPaymentId: r.lastpaymentid ? safeStr(r.lastpaymentid, 50) : null,
        recurring:     r.recurring === 'true' || r.recurring === '1' || !!r.loanid,
      })),
      loans: loanRows.map((r) => {
        const lid = safeStr(r.id || uid(), 50);
        return {
          id:            lid,
          name:          safeStr(r.name, 100),
          total:         safeNum(r.total),
          frequency:     S.VALID_FREQS.has(r.frequency) ? r.frequency : 'monthly',
          paymentAmount: safeNum(r.paymentamount),
          monthsPaid:    Math.max(0, Math.floor(safeNum(r.monthspaid))),
          ...(r.paidperiods != null && r.paidperiods !== '' ? { paidPeriods: Math.max(0, Math.floor(safeNum(r.paidperiods))), startingCredit: safeNum(r.startingcredit) } : {}),
          budgetEntryId: r.budgetentryid ? safeStr(r.budgetentryid, 50) : null,
          payments:      (paymentsByLoan[lid] || []).map((p) => ({ ...p })),
        };
      }),
    };

    const month = S.currentMonth();
    return { version: 3, activeMonth: month, viewedMonth: month, currency: S.getCurrency(),
      months: { [month]: sanitizeState(newState) } };
  }

  function applyImport(doc) {
    if (!S.loadDocument(doc)) throw new Error('Could not load imported document.');
    App.persistence.resume();
    const currency = S.getCurrency();
    const parts = currency.split('|');
    if (parts.length === 2) {
      App.utils.setCurrency(parts[0], parts[1]);
      const select = document.getElementById('currency-select');
      if (select) select.value = currency;
    }
    App.render.all();
    App.persistence.requestSave();
  }

  /* ──────────────────────────────────────────────────────
     REFERENTIAL INTEGRITY CHECK
  ────────────────────────────────────────────────────── */
  function enforceReferentialIntegrity(st) {
    function countIds(items) {
      const counts = new Map();
      items.forEach((item) => {
        const id = safeStr(item && item.id, 50);
        if (!id) return;
        counts.set(id, (counts.get(id) || 0) + 1);
      });
      return counts;
    }

    function ensureUniqueId(rawId, used) {
      let id = safeStr(rawId, 50);
      if (!id || used.has(id)) {
        id = uid();
        while (used.has(id)) id = uid();
      }
      used.add(id);
      return id;
    }

    function relabel(items, counts, used, mapForUniqueOldIds) {
      items.forEach((item) => {
        const oldId = safeStr(item.id, 50);
        const newId = ensureUniqueId(oldId, used);
        item.id = newId;
        if (oldId && counts.get(oldId) === 1 && mapForUniqueOldIds) {
          mapForUniqueOldIds.set(oldId, newId);
        }
      });
    }

    const loanIdCounts = countIds(st.loans);
    const budgetIdCounts = countIds(st.budget);
    const usedSalaryIds = new Set();
    const usedSavingsIds = new Set();
    const usedBudgetIds = new Set();
    const usedLoanIds = new Set();
    const oldLoanToNew = new Map();
    const oldBudgetToNew = new Map();

    relabel(st.salary, countIds(st.salary), usedSalaryIds);
    relabel(st.savings, countIds(st.savings), usedSavingsIds);
    relabel(st.budget, budgetIdCounts, usedBudgetIds, oldBudgetToNew);
    relabel(st.loans, loanIdCounts, usedLoanIds, oldLoanToNew);

    st.loans.forEach((loan) => {
      loan.payments = Array.isArray(loan.payments) ? loan.payments : [];
      loan.monthsPaid = Math.max(0, Math.floor(safeNum(loan.monthsPaid)));
      const usedPaymentIds = new Set();
      loan.payments = loan.payments.map((p) => ({
        id: ensureUniqueId(p && p.id, usedPaymentIds),
        date: safeStr(p && p.date, 30),
        amount: safeNum(p && p.amount),
      }));
    });

    st.budget.forEach((b) => {
      if (!b.loanId) {
        b.loanId = null;
        b.lastPaymentId = null;
        return;
      }
      const mappedLoanId = oldLoanToNew.get(safeStr(b.loanId, 50));
      if (!mappedLoanId) {
        b.loanId = null;
        b.lastPaymentId = null;
        return;
      }
      b.loanId = mappedLoanId;
      if (b.lastPaymentId) b.lastPaymentId = safeStr(b.lastPaymentId, 50);
    });

    st.loans.forEach((l) => {
      if (!l.budgetEntryId) {
        l.budgetEntryId = null;
        return;
      }
      const mappedBudgetId = oldBudgetToNew.get(safeStr(l.budgetEntryId, 50));
      l.budgetEntryId = mappedBudgetId || null;
    });

    // A single loan can only be linked to one budget entry.
    const firstBudgetByLoanId = new Map();
    st.budget.forEach((b) => {
      if (!b.loanId) return;
      if (!firstBudgetByLoanId.has(b.loanId)) {
        firstBudgetByLoanId.set(b.loanId, b.id);
      } else {
        b.loanId = null;
        b.lastPaymentId = null;
      }
    });

    // Enforce bidirectional consistency (loan.budgetEntryId <-> budget.loanId).
    st.loans.forEach((l) => {
      const expectedBudgetId = firstBudgetByLoanId.get(l.id) || null;
      l.budgetEntryId = expectedBudgetId;
    });

    const loanById = new Map(st.loans.map((l) => [l.id, l]));
    st.budget.forEach((b) => {
      if (!b.loanId) {
        b.lastPaymentId = null;
        return;
      }
      const loan = loanById.get(b.loanId);
      if (!loan) {
        b.loanId = null;
        b.lastPaymentId = null;
        return;
      }
      if (!b.lastPaymentId) return;
      const exists = (loan.payments || []).some((p) => p.id === b.lastPaymentId);
      if (!exists) b.lastPaymentId = null;
    });
  }

  /* ──────────────────────────────────────────────────────
     CSV LINE PARSER (handles quoted fields with commas)
  ────────────────────────────────────────────────────── */
  function parseCsvLine(line) {
    const result  = [];
    let current   = '';
    let inQuotes  = false;

    for (let i = 0; i < line.length; i++) {
      const ch   = line[i];
      const next = line[i + 1];

      if (ch === '"') {
        if (inQuotes && next === '"') {
          // Escaped quote inside quoted field
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  /* ──────────────────────────────────────────────────────
     EXPORT
  ────────────────────────────────────────────────────── */
  App.io = {
    exportJSON,
    exportCSV,
    processFile,
    applyImport,
    defaultFilename,
    resolveFilename,
  };
})();
